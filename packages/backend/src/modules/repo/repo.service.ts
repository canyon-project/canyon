import { Injectable } from '@nestjs/common'
import {InjectRepository} from "@mikro-orm/nestjs";
import {EntityRepository} from "@mikro-orm/core";
import {RepoEntity} from "../../entities/repo.entity";

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(RepoEntity) private readonly repoRepo: EntityRepository<RepoEntity>,
  ) {
  }
  async getRepo(id: string) {
    if (isNaN(Number(id))) {
      const r = await this.repoRepo.findOne({
        pathWithNamespace:id
      });
      return r
    } else {
      const r = await this.repoRepo.findOne({
        id:id
      });
      return r
    }
  }

  async getRepos(keyword?: string) {
    // TODO: 接入数据库查询
    const repos =await this.repoRepo.findAll({
      where:{}
    })
    return {
      data: repos
    }
  }

  async postRepoById(id: string) {
    // TODO: 接入数据库/第三方系统
    return { ok: true, id }
  }

  async getRepoCommits(repoID: string) {
    // TODO: 接入 VCS
    return { repoID, commits: [] }
  }

  async getRepoPulls(repoID: string) {
    // TODO: 接入 VCS
    return { repoID, pulls: [] }
  }

  async getRepoCommitBySHA(repoID: string, sha: string) {
    // TODO: 接入 VCS
    return { repoID, sha, commit: null }
  }
}
