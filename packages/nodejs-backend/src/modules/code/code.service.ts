import { BadRequestException, Injectable } from '@nestjs/common';
import { SystemConfigService } from '../system-config/system-config.service';
import { Optional } from '@nestjs/common';

@Injectable()
export class CodeService {
  constructor(@Optional() private readonly syscfg?: SystemConfigService) {}

  private async getGitLabCfg() {
    const base = (await this.syscfg?.get('system_config.gitlab_base_url')) || process.env.GITLAB_BASE_URL;
    const token = (await this.syscfg?.get('git_provider[0].private_token')) || process.env.GITLAB_TOKEN;
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }
  async getFileContent({ repoID, sha, pullNumber, filepath, provider }: any) {
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
    let ref = sha;
    if (!ref && pullNumber) {
      const pid = encodeURIComponent(repoID);
      const prURL = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullNumber)}`;
      const prResp = await fetch(prURL as any, { headers: { 'PRIVATE-TOKEN': token } });
      if (prResp.ok) {
        const pr: any = await prResp.json();
        ref = pr?.diff_refs?.head_sha || pr?.sha || null;
      }
      if (!ref) throw new BadRequestException('无法从Pull Request解析head sha');
    }
    const pid = encodeURIComponent(repoID);
    const filePath = encodeURIComponent(filepath);
    const url = `${base}/api/v4/projects/${pid}/repository/files/${filePath}?ref=${encodeURIComponent(ref!)}`;
    const resp = await fetch(url as any, { headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' } });
    if (!resp.ok) return { content: null };
    const data: any = await resp.json();
    return { content: data?.content ?? null };
  }

  async getPullRequest({ projectID, pullRequestID }: any) {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(projectID);
    const mrURL = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullRequestID)}`;
    const commitsURL = `${mrURL}/commits`;
    const [mrResp, commitsResp] = await Promise.all([
      fetch(mrURL as any, { headers: { 'PRIVATE-TOKEN': token } }),
      fetch(commitsURL as any, { headers: { 'PRIVATE-TOKEN': token } })
    ]);
    if (!mrResp.ok) return {};
    const pr = await mrResp.json();
    const commits = commitsResp.ok ? await commitsResp.json() : [];
    return { pull_request: { ...pr, commits, commits_count: commits?.length ?? 0 } };
  }

  async getPullRequestChanges({ projectID, pullRequestID }: any) {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(projectID);
    const url = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(pullRequestID)}/changes`;
    const resp = await fetch(url as any, { headers: { 'PRIVATE-TOKEN': token } });
    if (!resp.ok) return [];
    return await resp.json();
  }

  async getProjectByPath(path: string) {
    if (!path) {
      throw new BadRequestException('项目路径不能为空');
    }
    const { base, token } = await this.getGitLabCfg();
    const encoded = encodeURIComponent(path);
    const url = `${base}/api/v4/projects/${encoded}`;
    const resp = await fetch(url as any, { headers: { 'PRIVATE-TOKEN': token } });
    if (!resp.ok) return { path, project: null };
    return await resp.json();
  }
}


