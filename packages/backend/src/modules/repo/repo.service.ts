import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, Optional } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../entities/coverage.entity';
import { RepoEntity } from '../../entities/repo.entity';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(RepoEntity)
    private readonly repoRepo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @Optional() private readonly syscfg: SystemConfigService,
    @Optional() private readonly orm: MikroORM,
  ) {}

  private async getGitLabCfg() {
    const base =
      (await this.syscfg?.get('system_config.gitlab_base_url')) ||
      process.env.GITLAB_BASE_URL;
    const token =
      (await this.syscfg?.get('git_provider[0].private_token')) ||
      process.env.GITLAB_TOKEN;
    if (!base || !token) return null;
    return { base, token };
  }

  private async resolveProjectId(repo: RepoEntity): Promise<number | null> {
    // If repo.id is numeric string, use it directly
    const numeric = Number(repo.id);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return Math.trunc(numeric);
    }
    const cfg = await this.getGitLabCfg();
    if (!cfg) return null;
    try {
      const pidPath = encodeURIComponent(repo.pathWithNamespace);
      const url = `${cfg.base}/api/v4/projects/${pidPath}`;
      const resp = await axios.get(url, {
        headers: { 'PRIVATE-TOKEN': cfg.token },
      });
      if (resp.status >= 200 && resp.status < 300) {
        const id = (resp.data as Record<string, unknown>)?.id;
        if (typeof id === 'number') return id;
        if (typeof id === 'string' && id) {
          const n = Number(id);
          return Number.isNaN(n) ? null : Math.trunc(n);
        }
      }
    } catch {}
    return null;
  }
  async getRepo(id: string) {
    if (Number.isNaN(Number(id))) {
      const r = await this.repoRepo.findOne({
        pathWithNamespace: id,
      });
      return r;
    } else {
      const r = await this.repoRepo.findOne({
        id: id,
      });
      return r;
    }
  }

  async getRepos(_keyword?: string) {
    const conn = this.orm.em.getConnection();
    const rows = (await conn.execute(
      'select r.id as id, r.bu as bu, r.scopes as scopes, r.path_with_namespace as path_with_namespace, r.description as description, max(c.updated_at) as last_updated_at, count(distinct c.sha) as sha_count from "canyonjs_repo" as r left join "canyonjs_coverage" as c on c.repo_id = r.id group by r.id, r.path_with_namespace, r.description order by last_updated_at desc nulls last',
    )) as Array<{
      id: string;
      path_with_namespace: string;
      description: string;
      last_updated_at: string | null;
      sha_count: number;
      bu: string;
      scopes: any;
    }>;

    return {
      data: rows.map((r) => {
        return {
          id: r.id,
          pathWithNamespace: r.path_with_namespace,
          description: r.description,
          lastReportTime: r.last_updated_at,
          reportTimes: r.sha_count,
          bu: r.bu,
          scopes: r.scopes,
        };
      }),
    };
  }

  async postRepoById(id: string) {
    // TODO: 接入数据库/第三方系统
    return { ok: true, id };
  }

  async getRepoCommits(repoID: string) {
    // this.getRepo()

    const conn = this.covRepo.getEntityManager().getConnection();
    const rows = await conn.execute(
      'select c.sha as sha, max(c.created_at) as last_created_at from "canyonjs_coverage" as c where c.repo_id = ? group by c.sha order by last_created_at desc',
      [repoID],
    );

    const commits = rows.map(
      (row: { sha: string; last_created_at: string }) => {
        return {
          sha: row.sha,
          lastCoverageCreatedAt: row.last_created_at,
        };
      },
    );
    return { repoID, commits };
  }

  async getRepoPulls(repoID: string) {
    // 1) 获取仓库记录（支持数字ID或 path_with_namespace）
    const repo = await this.getRepo(repoID);
    if (!repo) return { repoID, pulls: [] };

    // 2) 查询该仓库覆盖率表中的去重 SHA（最近优先）
    const conn = this.covRepo.getEntityManager().getConnection();
    const rows = (await conn.execute(
      'select c.sha as sha, max(c.created_at) as last_created_at from "canyonjs_coverage" as c where c.repo_id = ? group by c.sha order by last_created_at desc limit 200',
      [repo.id],
    )) as Array<{ sha: string; last_created_at: string }>;
    const shas = rows.map((r) => r.sha).filter((s) => typeof s === 'string');
    if (shas.length === 0) return { repoID: repo.id, pulls: [] };

    // 3) 解析 GitLab 项目ID
    const projectId = await this.resolveProjectId(repo);
    if (!projectId) return { repoID: repo.id, pulls: [] };

    const cfg = await this.getGitLabCfg();
    if (!cfg) return { repoID: repo.id, pulls: [] };

    // 4) 针对每个 SHA 获取关联的 Merge Requests，并去重
    const seen = new Set<string>();
    const pulls: unknown[] = [];
    await Promise.all(
      shas.map(async (sha) => {
        try {
          const url = `${cfg.base}/api/v4/projects/${encodeURIComponent(String(projectId))}/repository/commits/${encodeURIComponent(sha)}/merge_requests`;
          const resp = await axios.get(url, {
            headers: {
              'PRIVATE-TOKEN': cfg.token,
              'Content-Type': 'application/json',
            },
          });
          if (
            resp.status >= 200 &&
            resp.status < 300 &&
            Array.isArray(resp.data)
          ) {
            for (const mr of resp.data as Array<Record<string, unknown>>) {
              const projectIdRaw = (mr as { project_id?: number | string })
                ?.project_id;
              const project_id =
                typeof projectIdRaw === 'number' ||
                typeof projectIdRaw === 'string'
                  ? projectIdRaw
                  : projectId;
              const iidRaw = (mr as { iid?: number | string })?.iid;
              const iid =
                typeof iidRaw === 'number' ? iidRaw : Number(iidRaw ?? 0) || 0;
              const key = `${project_id}:${iid}`;
              if (!seen.has(key)) {
                seen.add(key);
                pulls.push(mr);
              }
            }
          }
        } catch {
          // ignore per-sha errors
        }
      }),
    );

    return { repoID: repo.id, pulls };
  }

  async getRepoCommitBySHA(repoID: string, sha: string) {
    // TODO: 接入 VCS
    return { repoID, sha, commit: null };
  }
}
