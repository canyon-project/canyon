import axios from "axios";
import type { CommitDetail } from "./types.ts";
import type { ScmAdapter } from "./adapter.ts";

const GITHUB_BASE = "https://api.github.com";

type GithubScmConfig = { type: "github"; token: string };

export class GithubAdapter implements ScmAdapter {
  private readonly base = GITHUB_BASE;
  private readonly token: string;

  constructor(config: GithubScmConfig) {
    this.token = config.token;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github.v3+json",
    };
  }

  private async resolveOwnerRepo(repoID: string): Promise<{ owner: string; repo: string }> {
    if (repoID.includes("/")) {
      const [owner, repo] = repoID.split("/");
      if (owner && repo) return { owner, repo };
    }
    if (/^[0-9]+$/.test(repoID)) {
      const url = `${this.base}/repositories/${encodeURIComponent(repoID)}`;
      const { data } = await axios.get<{ full_name?: string }>(url, {
        headers: this.headers(),
        timeout: 10000,
      });
      const fullName = data?.full_name;
      if (fullName?.includes("/")) {
        const [owner, repo] = fullName.split("/");
        return { owner, repo };
      }
    }
    throw new Error("GitHub repoID 需为 owner/repo 或数字 ID");
  }
  async getCommitDetail(repoID: string, sha: string, provider: string): Promise<CommitDetail> {
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`;
    const { data } = await axios.get<{
      sha?: string;
      commit?: {
        message?: string;
        author?: { name?: string; email?: string; date?: string };
        committer?: { name?: string; email?: string; date?: string };
      };
      author?: { login?: string; avatar_url?: string };
      parents?: Array<{ sha?: string }>;
      stats?: { additions?: number; deletions?: number };
      [key: string]: unknown;
    }>(url, { headers: this.headers(), timeout: 10000 });
    const commit = data?.commit ?? {};
    const author = commit?.author ?? commit?.committer;
    const createdAt = author?.date ?? "";
    return {
      sha: data?.sha ?? sha,
      provider,
      repoID,
      commitMessage: commit?.message ?? "",
      authorName: author?.name ?? "",
      authorEmail: author?.email ?? "",
      createdAt,
      parents: data?.parents,
      stats: data?.stats,
      ...data,
    };
  }
}
