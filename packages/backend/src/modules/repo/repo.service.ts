import { Injectable } from '@nestjs/common';

@Injectable()
export class RepoService {
  async getRepos(keyword?: string) {
    // TODO: 接入数据库查询
    return { items: [], keyword: keyword ?? null };
  }

  async postRepoById(id: string) {
    // TODO: 接入数据库/第三方系统
    return { ok: true, id };
  }

  async getRepoCommits(repoID: string) {
    // TODO: 接入 VCS
    return { repoID, commits: [] };
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


