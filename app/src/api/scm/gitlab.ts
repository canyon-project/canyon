import axios from "axios";
import type { ChangedFile, CommitDetail, CommitInfo, CompareDiffItem } from "./types.ts";
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

  async getChangedFiles(repoID: string, base: string, head: string): Promise<ChangedFile[]> {
    const diffs = await this.getCompareDiffs(repoID, base, head);
    return diffs.map((d) => {
      const path = d.new_path || d.old_path || "";
      let status: "added" | "modified" | "removed" = "modified";
      if (d.new_file) status = "added";
      else if (d.deleted_file) status = "removed";
      return { path, status };
    });
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

  async getCommitsBetween(repoID: string, fromSha: string, toSha: string): Promise<string[]> {
    const pid = encodeURIComponent(repoID);
    const url = `${this.base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(fromSha)}&to=${encodeURIComponent(toSha)}`;
    const { data } = await axios.get<{ commits?: Array<{ id?: string }> }>(url, {
      headers: this.headers(),
      timeout: 10000,
    });
    const commits = data?.commits ?? [];
    const shas = commits.map((c) => c.id).filter(Boolean) as string[];
    if (!shas.includes(fromSha)) shas.unshift(fromSha);
    if (!shas.includes(toSha)) shas.push(toSha);
    return shas;
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

  async getSourceFiles(
    repoID: string,
    sha: string,
    filePaths: string[],
  ): Promise<Map<string, string>> {
    if (filePaths.length === 0) return new Map();
    const pid = encodeURIComponent(repoID);
    const archiveUrl = `${this.base}/api/v4/projects/${pid}/repository/archive.zip`;
    const resp = await axios.get(archiveUrl, {
      headers: this.headers(),
      params: { sha },
      responseType: "arraybuffer",
      timeout: 60000,
    });
    const { default: AdmZip } = await import("adm-zip");
    const { tmpNameSync } = await import("tmp");
    const fs = await import("node:fs");
    const tempZip = tmpNameSync({ postfix: ".zip" });
    try {
      fs.writeFileSync(tempZip, resp.data);
      const zip = new AdmZip(tempZip);
      const entries = zip.getEntries();
      const targetSet = new Set(filePaths);
      const result = new Map<string, string>();
      for (const entry of entries) {
        if (entry.isDirectory) continue;
        const name = entry.entryName;
        const parts = name.split("/");
        if (parts.length < 2) continue;
        const relativePath = parts.slice(1).join("/");
        if (!targetSet.has(relativePath)) continue;
        try {
          const content = entry.getData().toString("utf8");
          result.set(relativePath, content);
        } catch {
          // skip binary or invalid utf8
        }
      }
      return result;
    } finally {
      try {
        fs.unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }
  }
}
