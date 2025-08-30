import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CoverageEntity } from '../../entities/coverage.entity';
import { RepoEntity } from '../../entities/repo.entity';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(RepoEntity)
    private readonly repoRepo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
  ) {}
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
    // TODO: 接入数据库查询
    const repos = await this.repoRepo.findAll({
      where: {},
    });
    return {
      data: repos,
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
    // TODO: 接入 VCS
    return { repoID, pulls: [] };
  }

  async getRepoCommitBySHA(repoID: string, sha: string) {
    // TODO: 接入 VCS
    return { repoID, sha, commit: null };
  }
}
