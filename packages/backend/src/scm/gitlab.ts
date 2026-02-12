import AdmZip from 'adm-zip';
import axios from 'axios';
import * as fs from 'node:fs';
import * as tmp from 'tmp';
import type {
  ChangedFile,
  CommitInfo,
  CompareDiffItem,
  RepoInfo,
} from './types';
import type { ScmAdapter } from './adapter';

type GitlabScmConfig = { type: 'gitlab'; base: string; token: string };

export class GitlabAdapter implements ScmAdapter {
  private readonly base: string;
  private readonly token: string;

  constructor(config: GitlabScmConfig) {
    this.base = config.base.replace(/\/$/, '');
    this.token = config.token;
  }

  private headers() {
    return { 'PRIVATE-TOKEN': this.token };
  }

  /**
   * 支持 repoID：数字 ID，或 org/repo（path_with_namespace）形式；path 需 URL 编码
   */
  async getRepoInfo(repoID: string): Promise<RepoInfo> {
    const raw = repoID.trim();
    const id = raw.includes('/') ? encodeURIComponent(raw) : raw;
    const url = `${this.base}/api/v4/projects/${id}`;
    const { data } = await axios.get<{
      path_with_namespace?: string;
      description?: string;
    }>(url, {
      headers: this.headers(),
      timeout: 10000,
    });
    if (!data?.path_with_namespace) {
      throw new Error('GitLab 未返回 path_with_namespace');
    }
    return {
      pathWithNamespace: data.path_with_namespace,
      description: data.description ?? '',
    };
  }

  async getChangedFiles(repoID: string, base: string, head: string): Promise<ChangedFile[]> {
    const diffs = await this.getCompareDiffs(repoID, base, head);
    return diffs.map((d) => {
      const path = d.new_path || d.old_path || '';
      let status: 'added' | 'modified' | 'removed' = 'modified';
      if (d.new_file) status = 'added';
      else if (d.deleted_file) status = 'removed';
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

  async getCompareDiffs(
    repoID: string,
    from: string,
    to: string,
  ): Promise<CompareDiffItem[]> {
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
    if (!data?.content) return '';
    return Buffer.from(data.content, 'base64').toString('utf8');
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
      responseType: 'arraybuffer',
      timeout: 60000,
    });
    const tempZip = tmp.tmpNameSync({ postfix: '.zip' });
    try {
      fs.writeFileSync(tempZip, resp.data);
      const zip = new AdmZip(tempZip);
      const entries = zip.getEntries();
      const targetSet = new Set(filePaths);
      const result = new Map<string, string>();
      for (const entry of entries) {
        if (entry.isDirectory) continue;
        const name = entry.entryName;
        const parts = name.split('/');
        if (parts.length < 2) continue;
        const relativePath = parts.slice(1).join('/');
        if (!targetSet.has(relativePath)) continue;
        try {
          const content = entry.getData().toString('utf8');
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
