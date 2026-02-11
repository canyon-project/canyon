import axios from 'axios';
import type { ChangedFile, RepoInfo } from './types';
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
    const { data } = await axios.get<{ full_name?: string; description?: string }>(url, {
      headers: this.headers(),
      timeout: 10000,
    });
    if (!data?.full_name) {
      throw new Error('GitHub 未返回 full_name');
    }
    return {
      pathWithNamespace: data.full_name,
      description: data.description ?? '',
    };
  }

  async getChangedFiles(repoID: string, base: string, head: string): Promise<ChangedFile[]> {
    const { owner, repo } = await this.resolveOwnerRepo(repoID);
    const url = `${this.base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
    const { data } = await axios.get<{ files?: Array<{ filename?: string; status?: string }> }>(
      url,
      { headers: this.headers(), timeout: 10000 },
    );
    const files = data?.files ?? [];
    const statusMap: Record<string, 'added' | 'modified' | 'removed'> = {
      added: 'added',
      modified: 'modified',
      removed: 'removed',
      renamed: 'modified',
    };
    return files
      .filter((f) => f.filename)
      .map((f) => ({
        path: f.filename!,
        status: statusMap[f.status ?? ''] ?? 'modified',
      }));
  }
}
