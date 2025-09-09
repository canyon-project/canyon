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

  async getRepos(keyword?: string, bu?: string[]) {
    const conn = this.orm.em.getConnection();

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword?.trim()) {
      const like = `%${keyword.trim()}%`;
      conditions.push('(r.id ilike ? or r.path_with_namespace ilike ?)');
      params.push(like, like);
    }
    if (Array.isArray(bu) && bu.length > 0) {
      const placeholders = bu.map(() => '?').join(', ');
      conditions.push(`r.bu in (${placeholders})`);
      params.push(...bu);
    }

    const whereSQL = conditions.length
      ? ` where ${conditions.join(' and ')}`
      : '';

    const sql =
      'select r.id as id, r.bu as bu, r.scopes as scopes, r.path_with_namespace as path_with_namespace, r.description as description, max(c.updated_at) as last_updated_at, count(distinct c.sha) as sha_count ' +
      'from "canyonjs_repo" as r ' +
      'left join "canyonjs_coverage" as c on c.repo_id = r.id' +
      whereSQL +
      ' group by r.id, r.path_with_namespace, r.description, r.bu, r.scopes' +
      ' order by last_updated_at desc nulls last';

    const rows = (await conn.execute(sql, params)) as Array<{
      id: string;
      path_with_namespace: string;
      description: string;
      last_updated_at: string | null;
      sha_count: number;
      bu: string;
      scopes: [
        {
          buildTarget: string;
          includes: string[];
          excludes: string[];
        },
      ];
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

  async updateRepo(
    id: string,
    bu?: string,
    description?: string,
    config?: string,
  ) {
    if (!id) return { ok: false, id };
    const sets: string[] = [];
    const params: unknown[] = [];

    if (typeof bu === 'string') {
      sets.push('bu = ?');
      params.push(bu);
    }
    if (typeof description === 'string') {
      sets.push('description = ?');
      params.push(description);
    }
    if (typeof config === 'string') {
      sets.push('config = ?');
      params.push(config);
    }
    if (sets.length === 0) return { ok: true, id };

    // always update updated_at
    sets.push('updated_at = now()');

    const sql = `update "canyonjs_repo" set ${sets.join(', ')} where id = ?`;
    params.push(id);

    const conn = this.orm.em.getConnection();
    await conn.execute(sql, params);
    return { ok: true, id };
  }

  async getRepoCommits(repoID: string) {
    // this.getRepo()
    const repo = await this.getRepo(repoID);
    if (!repo) return { repoID, commits: [] };

    const conn = this.covRepo.getEntityManager().getConnection();
    const rows = await conn.execute(
      `SELECT
         c.sha,
         MAX(c.created_at) as last_created_at,
         ARRAY_AGG(DISTINCT c.branch) as branches
       FROM "canyonjs_coverage" as c
       WHERE c.repo_id = ?
       GROUP BY c.sha
       ORDER BY last_created_at DESC`,
      [repoID],
    );

    const projectId = await this.resolveProjectId(repo);
    const cfg = await this.getGitLabCfg();

    const commits = await Promise.all(
      rows.map(
        async (row: {
          sha: string;
          last_created_at: string;
          branches: string;
        }) => {
          if (projectId && cfg) {
            const url = `${cfg.base}/api/v4/projects/${projectId}/repository/commits/${row.sha}`;
            const resp = await axios.get(url, {
              headers: { 'PRIVATE-TOKEN': cfg.token },
            });

            return {
              sha: row.sha,
              lastCoverageCreatedAt: row.last_created_at,
              branches: row.branches,
              commitMessage: resp.data?.message || '',
            };
          }
        },
      ),
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
