import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { diffLine } from '../../helpers/diff';
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
    const { base, token } = await this.getGithubCfg();
    // 解析 ref
    let ref: string | null | undefined = sha ?? null;
    // /repos/{owner}/{repo}/pulls/{number} -> head.sha
    if (!ref && pullNumber) {
      const { owner, repo } = await this.resolveGithubOwnerRepoByID(
        repoID,
        base,
        token,
      );
      const prURL = `${base}/repos/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(repo)}/pulls/${encodeURIComponent(pullNumber)}`;
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
    if ((provider || 'gitlab').startsWith('github')) {
      return this.getFileContentFromGithub({
        repoID,
        sha,
        pullNumber,
        filepath,
        provider,
      });
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

  /**
   * 获取指定 subject 的所有差异文件及其差异行。
   * 新实现：先获取文件列表，再单独获取文件内容进行 JS diff 对比，避免 GitLab API 超限问题。
   * - subject: 'commit' | 'pulls' | 'multiple-commits'
   * - subjectID: commit sha、merge request number 或 commit1...commit2
   * - compareTarget: 当 subject 为 commit 时用于 /compare；未提供则不对比（返回空）
   * - filepath: 可选的文件路径筛选条件，精确匹配
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
    // 实现 multiple-commits 的情况
    if (subject === 'multiple-commits') {
      const providerValue = provider || 'gitlab';

      // 构建查询条件
      const where: any = {
        provider: providerValue,
        repo_id: repoID,
        subject_id: subjectID,
        subject: 'multiple-commits',
      };

      // 如果提供了 filepath，添加精确匹配条件
      if (filepath) {
        where.path = filepath;
      }

      // 查询 diff 表
      const diffRecords = await this.prisma.diff.findMany({
        where,
        select: {
          path: true,
          additions: true,
          deletions: true,
        },
      });

      // 转换为返回格式
      const files = diffRecords.map((record) => ({
        path: record.path,
        additions: record.additions,
        deletions: record.deletions,
      }));

      return { files };
    }

    // 其他 subject 类型暂未实现
    return { files: [] };
  }

  /**
   * 获取两个 commit 之间的所有 commit SHA 列表（包含 from 和 to）
   * 使用 GitLab API 的 compare 接口
   */
  private async getCommitsBetween({
    repoID,
    fromSha,
    toSha,
  }: {
    repoID: string;
    fromSha: string;
    toSha: string;
  }): Promise<string[]> {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(repoID);
    // GitLab compare API: /projects/{id}/repository/compare?from={from}&to={to}
    const url = `${base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(fromSha)}&to=${encodeURIComponent(toSha)}`;
    const resp = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': token,
      },
    });

    if (resp.status < 200 || resp.status >= 300) {
      throw new BadRequestException('无法获取 GitLab commit 列表');
    }

    // GitLab 返回的 commits 数组，按时间顺序从旧到新
    const commits = resp.data.commits || [];
    const commitShas = commits
      .map((c: { id?: string }) => c.id)
      .filter(Boolean);

    // 确保 fromSha 在列表中，如果不在则添加到开头
    if (!commitShas.includes(fromSha)) {
      commitShas.unshift(fromSha);
    }
    // 确保 toSha 在列表中，如果不在则添加
    if (!commitShas.includes(toSha)) {
      commitShas.push(toSha);
    }

    return commitShas;
  }

  /**
   * 获取多个 commit 之间的代码差异
   * @param repoID 仓库 ID
   * @param provider 提供商
   * @param subjectID 格式: commit1...commit2，commit1 是 from，commit2 是 to（基线）
   * @returns 差异文件列表，包含 fingerprint（所有 commit SHA 用逗号连接）
   */
  async getDiffForMultipleCommits({
    repoID,
    provider,
    subjectID,
  }: {
    repoID: string;
    provider: string;
    subjectID: string; // commit1...commit2，commit1 是 from，commit2 是基线
  }): Promise<
    Array<{
      id: string;
      provider: string;
      repo_id: string;
      from: string;
      to: string;
      subject_id: string;
      subject: string;
      path: string;
      additions: number[];
      deletions: number[];
      // fingerprint: string;
    }>
  > {
    // 解析 subjectID: commit1...commit2
    const parts = subjectID.split('...');
    if (parts.length !== 2) {
      throw new BadRequestException(
        'subjectID 格式错误，应为 commit1...commit2',
      );
    }
    const [fromSha, toSha] = parts;
    if (!fromSha || !toSha) {
      throw new BadRequestException('subjectID 格式错误，from 和 to 不能为空');
    }

    const fromShaTrimmed = fromSha.trim();
    const toShaTrimmed = toSha.trim();

    // 获取从 fromSha 到 toSha 之间的所有 commit
    const commitShas = await this.getCommitsBetween({
      repoID,
      fromSha: fromShaTrimmed,
      toSha: toShaTrimmed,
    });

    if (commitShas.length === 0) {
      throw new BadRequestException('未找到任何 commit');
    }

    // fingerprint 是所有 commit SHA 用逗号连接
    const fingerprint = commitShas.join(',');

    // 获取代码差异
    const { base, token } = await this.getGitLabCfg();
    const result = await diffLine({
      repoID,
      baseCommitSha: fromShaTrimmed,
      compareCommitSha: toShaTrimmed,
      includesFileExtensions: ['ts', 'tsx', 'jsx', 'vue', 'js'],
      gitlabUrl: base,
      token,
    });

    // 转换为返回格式
    const data = result.map(({ path, additions, deletions }) => {
      return {
        id: `${provider}|${repoID}|multiple-commits|${subjectID}|${path}`,
        provider: provider,
        repo_id: repoID,
        from: fromShaTrimmed,
        to: toShaTrimmed,
        subject_id: subjectID,
        subject: 'multiple-commits',
        path,
        additions,
        deletions,
        // fingerprint,
      };
    });

    return data;
  }
}
