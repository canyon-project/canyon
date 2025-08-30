import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import axios from 'axios';
import type { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class CodeService {
  constructor(@Optional() private readonly syscfg?: SystemConfigService) {}

  private async getGitLabCfg() {
    const base =
      (await this.syscfg?.get('system_config.gitlab_base_url')) ||
      process.env.GITLAB_BASE_URL;
    const token =
      (await this.syscfg?.get('git_provider[0].private_token')) ||
      process.env.GITLAB_TOKEN;
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }
  async getFileContent({
    repoID,
    sha,
    pullNumber,
    filepath,
    provider,
  }: {
    repoID: string;
    sha?: string | null;
    pullNumber?: string | null;
    filepath: string;
    provider?: string | null;
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
    const { base, token } = await this.getGitLabCfg();
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

  async getPullRequest({
    projectID,
    pullRequestID,
  }: {
    projectID: string;
    pullRequestID: string;
  }): Promise<Record<string, unknown>> {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(projectID);
    const mrURL = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullRequestID)}`;
    const commitsURL = `${mrURL}/commits`;
    const [mrResp, commitsResp] = await Promise.all([
      axios.get(mrURL, { headers: { 'PRIVATE-TOKEN': token } }),
      axios.get(commitsURL, { headers: { 'PRIVATE-TOKEN': token } }),
    ]);
    if (mrResp.status < 200 || mrResp.status >= 300) return {};
    const pr = mrResp.data as Record<string, unknown>;
    const commits =
      commitsResp.status >= 200 && commitsResp.status < 300
        ? (commitsResp.data as unknown[])
        : [];
    return {
      pull_request: {
        ...pr,
        commits,
        commits_count: Array.isArray(commits) ? commits.length : 0,
      },
    };
  }

  async getPullRequestChanges({
    projectID,
    pullRequestID,
  }: {
    projectID: string;
    pullRequestID: string;
  }): Promise<unknown> {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(projectID);
    const url = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullRequestID)}/changes`;
    const resp = await axios.get(url, { headers: { 'PRIVATE-TOKEN': token } });
    if (resp.status < 200 || resp.status >= 300) return [];
    return resp.data as unknown;
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
}
