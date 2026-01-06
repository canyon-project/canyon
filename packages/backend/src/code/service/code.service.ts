import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CodeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  public async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  private async getGithubCfg() {
    const base = 'https://api.github.com';
    const token = await this.configService.get('INFRA.GITHUB_PRIVATE_TOKEN');
    if (!token) throw new BadRequestException('GitHub 配置缺失');
    return { base, token };
  }

  private encodePathSegments(path: string) {
    // 逐段编码，避免斜杠被整体编码
    return path
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/');
  }

  private async resolveGithubOwnerRepoByID(
    idOrSlug: string,
    base: string,
    token: string,
  ) {
    // 如果是 owner/repo 直接返回
    if (idOrSlug.includes('/')) {
      const [owner, repo] = idOrSlug.split('/');
      if (!owner || !repo) {
        throw new BadRequestException(
          'GitHub repoID 需为 owner/repo 或数字 ID',
        );
      }
      return { owner, repo };
    }
    // 如果是纯数字，则通过 /repositories/{id} 解析
    if (/^[0-9]+$/.test(idOrSlug)) {
      const url = `${base}/repositories/${encodeURIComponent(idOrSlug)}`;
      const resp = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (resp.status < 200 || resp.status >= 300) {
        throw new BadRequestException('无法解析 GitHub 仓库 ID');
      }
      const data = resp.data as {
        full_name?: string;
        owner?: { login?: string };
        name?: string;
      };
      const fullName = data.full_name;
      if (fullName && fullName.includes('/')) {
        const [owner, repo] = fullName.split('/');
        return { owner, repo };
      }
      const owner = data.owner?.login;
      const repo = data.name;
      if (!owner || !repo) {
        throw new BadRequestException('GitHub 仓库信息不完整');
      }
      return { owner, repo };
    }
    throw new BadRequestException('GitHub repoID 需为 owner/repo 或数字 ID');
  }

  private async getFileContentFromGithub({
    repoID,
    sha,
    analysisNumber,
    filepath,
    provider,
  }: {
    repoID: string;
    sha?: string | null;
    analysisNumber?: string | null;
    filepath: string;
    provider?: string | null;
  }): Promise<{ content: string | null }> {
    const { base, token } = await this.getGithubCfg();
    // 解析 ref
    let ref: string | null | undefined = sha ?? null;
    // /repos/{owner}/{repo}/pulls/{number} -> head.sha
    if (!ref && analysisNumber) {
      const { owner, repo } = await this.resolveGithubOwnerRepoByID(
        repoID,
        base,
        token,
      );
      const prURL = `${base}/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(repo)}/pulls/${encodeURIComponent(analysisNumber)}`;
      const prResp = await axios.get(prURL, {
        headers: { Authorization: `token ${token}` },
      });
      if (prResp.status >= 200 && prResp.status < 300) {
        const prData = prResp.data as { head?: { sha?: string } };
        ref = prData?.head?.sha ?? null;
      }
      if (!ref) throw new BadRequestException('无法从Pull Request解析head sha');
    }
    if (!ref) throw new BadRequestException('缺少引用分支/提交（ref）');
    const { owner, repo } = await this.resolveGithubOwnerRepoByID(
      repoID,
      base,
      token,
    );
    const encodedPath = this.encodePathSegments(filepath);
    const fileURL = `${base}/repos/${encodeURIComponent(
      owner,
    )}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(
      ref,
    )}`;
    const resp = await axios.get(fileURL, {
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (resp.status < 200 || resp.status >= 300) return { content: null };
    const data = resp.data as { content?: unknown };
    const content = typeof data.content === 'string' ? data.content : null; // GitHub 返回 base64
    return { content };
  }

  async getFileContent({
    repoID,
    sha,
    analysisNumber,
    filepath,
    provider,
    gitlabConfig,
  }: {
    repoID: string;
    sha?: string | null;
    analysisNumber?: string | null;
    filepath: string;
    provider?: string | null;
    gitlabConfig?: { base: string; token: string };
  }): Promise<{ content: string | null }> {
    if (!repoID || !filepath) {
      throw new BadRequestException('repoID, filepath 为必填参数');
    }
    if (!sha && !analysisNumber) {
      throw new BadRequestException('sha 与 analysisNumber 至少提供一个');
    }
    if ((provider || 'gitlab').startsWith('github')) {
      return this.getFileContentFromGithub({
        repoID,
        sha,
        analysisNumber,
        filepath,
        provider,
      });
    }
    if ((provider || 'gitlab') !== 'gitlab') {
      return { content: null };
    }
    const { base, token } = gitlabConfig || (await this.getGitLabCfg());
    // 如果提供 analysisNumber 但未提供 sha，则解析 head sha
    let ref: string | null | undefined = sha;
    if (!ref && analysisNumber) {
      const pid = encodeURIComponent(repoID);
      const prURL = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(analysisNumber)}`;
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

  async getProjectByPathGithub(path: string, provider?: string) {
    if (!path) {
      throw new BadRequestException('项目路径不能为空');
    }
    const { base, token } = await this.getGithubCfg();
    // 支持 owner/repo 或数字仓库 ID
    let url: string;
    if (/^[0-9]+$/.test(path)) {
      url = `${base}/repositories/${encodeURIComponent(path)}`;
    } else {
      const [owner, repo] = (path || '').split('/');
      if (!owner || !repo) {
        throw new BadRequestException(
          'GitHub 项目路径需为 owner/repo 或数字 ID',
        );
      }
      url = `${base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    }
    const resp = await axios.get(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (resp.status < 200 || resp.status >= 300) return { path, project: null };
    return resp.data;
  }
}
