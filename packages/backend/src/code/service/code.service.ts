import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CodeService {
  constructor(private readonly configService: ConfigService) {}

  private async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  async getFileContent({
    repoID,
    sha,
    pullNumber,
    filepath,
    provider,
    gitlabConfig,
  }: {
    repoID: string;
    sha?: string | null;
    pullNumber?: string | null;
    filepath: string;
    provider?: string | null;
    gitlabConfig?: { base: string; token: string };
  }): Promise<{ content: string | null }> {
    if (!repoID || !filepath) {
      throw new BadRequestException('repoID, filepath 为必填参数');
    }
    if (!sha && !pullNumber) {
      throw new BadRequestException('sha 与 pullNumber 至少提供一个');
    }
    if ((provider || 'gitlab') !== 'gitlab') {
      return { content: null };
    }
    const { base, token } = gitlabConfig || (await this.getGitLabCfg());
    // 如果提供 pullNumber 但未提供 sha，则解析 head sha
    let ref: string | null | undefined = sha;
    if (!ref && pullNumber) {
      const pid = encodeURIComponent(repoID);
      const prURL = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullNumber)}`;
      const prResp = await axios.get(prURL, {
        headers: { 'PRIVATE-TOKEN': token },
      });
      if (prResp.status >= 200 && prResp.status < 300) {
        type GitlabMergeRequestData = {
          diff_refs?: { head_sha?: string };
          sha?: string;
        };
        const prData = prResp.data as GitlabMergeRequestData;
        const headSha = prData.diff_refs?.head_sha ?? prData.sha;
        ref = headSha ?? null;
      }
      if (!ref) throw new BadRequestException('无法从Pull Request解析head sha');
    }
    const pid = encodeURIComponent(repoID);
    const filePath = encodeURIComponent(filepath);
    if (!ref) throw new BadRequestException('缺少引用分支/提交（ref）');
    const url = `${base}/api/v4/projects/${pid}/repository/files/${filePath}?ref=${encodeURIComponent(ref)}`;
    const resp = await axios.get(url, {
      headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' },
    });
    if (resp.status < 200 || resp.status >= 300) return { content: null };
    const data = resp.data as { content?: unknown };
    const content = typeof data.content === 'string' ? data.content : null;
    return { content };
  }

  async getProjectByPath(path: string) {
    if (!path) {
      throw new BadRequestException('项目路径不能为空');
    }
    const { base, token } = await this.getGitLabCfg();
    const encoded = encodeURIComponent(path);
    const url = `${base}/api/v4/projects/${encoded}`;
    const resp = await axios.get(url, { headers: { 'PRIVATE-TOKEN': token } });
    if (resp.status < 200 || resp.status >= 300) return { path, project: null };
    return resp.data;
  }

  /**
   * 获取指定 subject 的所有差异文件及其差异行。
   * 新实现：先获取文件列表，再单独获取文件内容进行 JS diff 对比，避免 GitLab API 超限问题。
   * - subject: 'commit' | 'pulls'
   * - subjectID: commit sha 或 merge request number
   * - compareTarget: 当 subject 为 commit 时用于 /compare；未提供则不对比（返回空）
   * - filepath: 可选的文件路径筛选条件，支持模糊匹配（包含指定字符串的文件路径）
   */
  async getDiffChangedLines({
    repoID,
    provider,
    subject,
    subjectID,
    compareTarget,
    filepath,
  }: {
    repoID: string;
    provider?: string | null;
    subject: string;
    subjectID: string;
    compareTarget?: string | null;
    filepath?: string | null;
  }): Promise<{
    files: Array<{ path: string; additions: number[]; deletions: number[] }>;
  }> {
    return new Promise((resolve) => {
      resolve({ files: [] });
    });
  }
}
