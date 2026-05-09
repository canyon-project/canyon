import axios from "axios";
import type { CommitDetail, CommitInfo, CompareDiffItem } from "./types.ts";
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

  async getCommitInfo(repoID: string, sha: string): Promise<CommitInfo> {
    const pid = encodeURIComponent(repoID);
    const url = `${this.base}/api/v4/projects/${pid}/repository/commits/${encodeURIComponent(sha)}`;
    const { data } = await axios.get<{
      parent_ids?: string[];
      stats?: { additions?: number; deletions?: number };
    }>(url, { headers: this.headers(), timeout: 10000 });
    return {
      parent_ids: data?.parent_ids ?? [],
      stats: {
        additions: data?.stats?.additions ?? 0,
      },
    };
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

  async getCompareDiffs(repoID: string, from: string, to: string): Promise<CompareDiffItem[]> {
    const pid = encodeURIComponent(repoID);
    const url = `${this.base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const { data } = await axios.get<{
      diffs?: Array<{
        old_path?: string;
        new_path?: string;
        new_file?: boolean;
        deleted_file?: boolean;
      }>;
    }>(url, { headers: this.headers(), timeout: 10000 });
    return (data?.diffs ?? []).map((d) => ({
      old_path: d.old_path,
      new_path: d.new_path,
      new_file: d.new_file,
      deleted_file: d.deleted_file,
    }));
  }

  async getFileContent(repoID: string, path: string, ref: string): Promise<string> {
    const pid = encodeURIComponent(repoID);
    const encodedPath = encodeURIComponent(path);
    const url = `${this.base}/api/v4/projects/${pid}/repository/files/${encodedPath}?ref=${encodeURIComponent(ref)}`;
    const { data } = await axios.get<{ content?: string }>(url, {
      headers: this.headers(),
      timeout: 10000,
    });
    if (!data?.content) return "";
    return Buffer.from(data.content, "base64").toString("utf8");
  }
}
