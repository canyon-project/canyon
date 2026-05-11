import axios from "axios";
import type { CommitDetail } from "./types.ts";
import type { ScmAdapter } from "./adapter.ts";

type GitlabScmConfig = { type: "gitlab"; base: string; token: string };

export class GitlabAdapter implements ScmAdapter {
  private readonly base: string;
  private readonly token: string;

  constructor(config: GitlabScmConfig) {
    this.base = config.base.replace(/\/$/, "");
    this.token = config.token;
  }

  private headers() {
    return { "PRIVATE-TOKEN": this.token };
  }
  async getCommitDetail(repoID: string, sha: string, provider: string): Promise<CommitDetail> {
    const pid = encodeURIComponent(repoID);
    const url = `${this.base}/api/v4/projects/${pid}/repository/commits/${encodeURIComponent(sha)}`;
    const { data } = await axios.get<{
      id?: string;
      title?: string;
      message?: string;
      author_name?: string;
      author_email?: string;
      authored_date?: string;
      committed_date?: string;
      created_at?: string;
      parent_ids?: string[];
      stats?: { additions?: number; deletions?: number };
      [key: string]: unknown;
    }>(url, { headers: this.headers(), timeout: 10000 });
    const createdAt = data?.authored_date ?? data?.committed_date ?? data?.created_at ?? "";
    return {
      sha: data?.id ?? sha,
      provider,
      repoID,
      commitMessage: data?.message ?? data?.title ?? "",
      authorName: data?.author_name ?? "",
      authorEmail: data?.author_email ?? "",
      createdAt,
      parent_ids: data?.parent_ids ?? [],
      stats: data?.stats,
      ...data,
    };
  }
}
