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

const GITHUB_BASE = 'https://api.github.com';

type GithubScmConfig = { type: 'github'; token: string };

export class GithubAdapter implements ScmAdapter {
  private readonly base = GITHUB_BASE;
  private readonly token: string;

  constructor(config: GithubScmConfig) {
    this.token = config.token;
  }

  private headers() {
    return {
      Authorization: `token ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  private async resolveOwnerRepo(repoID: string): Promise<{ owner: string; repo: string }> {
    if (repoID.includes('/')) {
      const [owner, repo] = repoID.split('/');
      if (owner && repo) return { owner, repo };
    }
    if (/^[0-9]+$/.test(repoID)) {
      const url = `${this.base}/repositories/${encodeURIComponent(repoID)}`;
      const { data } = await axios.get<{ full_name?: string }>(url, {
        headers: this.headers(),
        timeout: 10000,
      });
      const fullName = data?.full_name;
      if (fullName?.includes('/')) {
        const [owner, repo] = fullName.split('/');
        return { owner, repo };
      }
    }
    throw new Error('GitHub repoID 需为 owner/repo 或数字 ID');
  }

  /**
   * 支持 repoID：数字 ID，或 owner/repo 形式
   */
  async getRepoInfo(repoID: string): Promise<RepoInfo> {
    const raw = repoID.trim();
    let url: string;
    if (raw.includes('/')) {
      const [owner, repo] = raw.split('/');
      if (!owner || !repo) throw new Error('GitHub owner/repo 格式无效');
      url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    } else {
      url = `${this.base}/repositories/${encodeURIComponent(raw)}`;
    }
    const { data } = await axios.get<{ id?: number; full_name?: string; description?: string }>(url, {
      headers: this.headers(),
      timeout: 10000,
    });
    if (!data?.full_name) {
      throw new Error('GitHub 未返回 full_name');
    }
    return {
      id: String(data.id),
      pathWithNamespace: data.full_name,
      description: data.description ?? '',
    };
  }

  async getChangedFiles(repoID: string, base: string, head: string): Promise<ChangedFile[]> {
    const diffs = await this.getCompareDiffs(repoID, base, head);
    const statusMap: Record<string, 'added' | 'modified' | 'removed'> = {
      added: 'added',
      modified: 'modified',
      removed: 'removed',
    };
    return diffs.map((d) => {
      const path = d.new_path || d.old_path || '';
      let status: 'added' | 'modified' | 'removed' = 'modified';
      if (d.new_file) status = 'added';
      else if (d.deleted_file) status = 'removed';
      return { path, status };
    });
  }

  async getCommitInfo(repoID: string, sha: string): Promise<CommitInfo> {
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`;
    const { data } = await axios.get<{
      parents?: Array<{ sha?: string }>;
      stats?: { additions?: number };
    }>(url, { headers: this.headers(), timeout: 10000 });
    return {
      parent_ids: (data?.parents ?? []).map((p) => p.sha ?? '').filter(Boolean),
      stats: { additions: data?.stats?.additions ?? 0 },
    };
  }

  async getCompareDiffs(
    repoID: string,
    from: string,
    to: string,
  ): Promise<CompareDiffItem[]> {
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(from)}...${encodeURIComponent(to)}`;
    const { data } = await axios.get<{
      files?: Array<{
        filename?: string;
        previous_filename?: string;
        status?: string;
      }>;
    }>(url, { headers: this.headers(), timeout: 10000 });
    const files = data?.files ?? [];
    return files.map((f) => ({
      old_path: f.previous_filename ?? f.filename,
      new_path: f.filename,
      new_file: f.status === 'added',
      deleted_file: f.status === 'removed',
    }));
  }

  async getFileContent(repoID: string, path: string, ref: string): Promise<string> {
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const encodedPath = path
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/');
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
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
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/zipball/${encodeURIComponent(sha)}`;
    const resp = await axios.get(url, {
      headers: { ...this.headers(), Accept: 'application/vnd.github.v3+json' },
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
