import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../../entities/coverage.entity';
import {
  computeJSDiffLines,
  filterChangedFilesForJsTs,
} from '../../../helpers/diff';
import { SystemConfigService } from '../../system-config/system-config.service';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @Optional() private readonly syscfg?: SystemConfigService,
  ) {}

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

  /**
   * 获取变更文件列表（不包含 diff 内容，避免超限）
   * 只返回 js、jsx、ts、tsx 文件，支持文件路径筛选
   */
  private async getChangedFilesList({
    repoID,
    subject,
    subjectID,
    compareTarget,
    gitlabConfig,
    filepath,
  }: {
    repoID: string;
    subject: string;
    subjectID: string;
    compareTarget?: string | null;
    gitlabConfig: { base: string; token: string };
    filepath?: string | null;
  }): Promise<
    Array<{
      old_path?: string;
      new_path?: string;
      new_file?: boolean;
      deleted_file?: boolean;
    }>
  > {
    const { base, token } = gitlabConfig;
    const pid = encodeURIComponent(repoID);

    // 过滤函数放到 helpers 中，保持 service 精简
    const filterFiles = filterChangedFilesForJsTs;

    if (
      subject.toLowerCase() === 'pulls' ||
      subject.toLowerCase() === 'mr' ||
      subject.toLowerCase() === 'merge_request'
    ) {
      // 对于 MR，使用 diffs API 而不是 changes API，因为 diffs 不包含 diff 内容
      const url = `${base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(subjectID)}/diffs`;
      const resp = await axios.get(url, {
        headers: { 'PRIVATE-TOKEN': token },
      });
      if (resp.status >= 200 && resp.status < 300) {
        const files = Array.isArray(resp.data) ? resp.data : [];
        return filterFiles(files);
      }
    } else if (subject.toLowerCase() === 'commit') {
      if (!compareTarget) {
        return [];
      }
      // 对于 commit 对比，先获取 compare 信息但不包含 diff
      const url = `${base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(compareTarget)}&to=${encodeURIComponent(subjectID)}&straight=false`;
      const resp = await axios.get(url, {
        headers: { 'PRIVATE-TOKEN': token },
      });
      if (resp.status >= 200 && resp.status < 300) {
        const data = resp.data as {
          diffs?: Array<{
            old_path?: string;
            new_path?: string;
            new_file?: boolean;
            deleted_file?: boolean;
          }>;
        };
        const files = Array.isArray(data?.diffs) ? data.diffs : [];
        return filterFiles(files);
      }
    }

    return [];
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
    if (!repoID || !subject || !subjectID) {
      throw new BadRequestException('repoID, subject, subjectID 为必填参数');
    }

    if ((provider || 'gitlab') !== 'gitlab') {
      return { files: [] };
    }
    // 一次性获取 GitLab 配置，避免重复查询数据库
    const gitlabConfig = await this.getGitLabCfg();

    // 统一在函数开始阶段解析 compareTarget 的优先级：
    // 1) 外部 compareTarget
    // 2) 当 subject 为 pulls/multiple-commits 时，取 MR 的 base_sha
    // 3) 头提交（head commit）在数据库中的 compareTarget
    // 另外：支持 subject 为 multiple-commits 的 a...b 语法
    const subj = subject.toLowerCase();
    let headSha: string | null = null;
    let baseSha: string | null = null;
    if (subj === 'pulls' || subj === 'pull') {
      const pid = encodeURIComponent(repoID);
      const mrURL = `${gitlabConfig.base}/api/v4/projects/${pid}/merge_requests/${encodeURIComponent(
        subjectID,
      )}`;
      const mrResp = await axios.get(mrURL, {
        headers: { 'PRIVATE-TOKEN': gitlabConfig.token },
      });
      if (mrResp.status >= 200 && mrResp.status < 300) {
        const mrData = mrResp.data as {
          diff_refs?: { base_sha?: string; head_sha?: string };
          sha?: string;
        };
        baseSha = mrData.diff_refs?.base_sha || null;
        headSha = mrData.diff_refs?.head_sha || mrData.sha || null;
      }
    } else if (subj === 'commit' || subj === 'commits') {
      headSha = subjectID;
    } else if (subj === 'multiple-commits') {
      // 解析 a...b 范围：b 作为 headSha，a 作为 compareTarget（若外部未提供）
      const parts = (subjectID || '').split('...');
      if (parts.length === 2) {
        const fromRef = parts[0]?.trim();
        const toRef = parts[1]?.trim();
        if (toRef) headSha = toRef;
        if (!compareTarget && fromRef) compareTarget = fromRef;
      }
    }

    // 优先级决策：外部 -> MR base -> 头提交数据库
    let resolvedCompareTarget: string | null | undefined = compareTarget;
    if (!resolvedCompareTarget && baseSha) {
      resolvedCompareTarget = baseSha;
    }
    if (!resolvedCompareTarget && headSha) {
      const coverages = await this.covRepo.find(
        {
          repoID,
          provider: provider || 'gitlab',
          sha: headSha,
        },
        {
          fields: ['compareTarget'],
          orderBy: { createdAt: QueryOrder.DESC, updatedAt: QueryOrder.DESC },
        },
      );
      if (coverages.length > 0 && coverages[0].compareTarget)
        resolvedCompareTarget = coverages[0].compareTarget;
    }

    // 将 subject 统一转换为 commit 语义
    if (!headSha) {
      return { files: [] };
    }
    subject = 'commit';
    subjectID = headSha;
    compareTarget = resolvedCompareTarget;

    // Step 1: 获取变更文件列表（不包含 diff 内容）
    const _changedFiles = await this.getChangedFilesList({
      repoID,
      subject: 'commit',
      subjectID,
      compareTarget,
      gitlabConfig,
      filepath,
    });
    const changedFiles = filepath
      ? _changedFiles.filter((i) => i.new_path === filepath)
      : _changedFiles;
    if (changedFiles.length === 0) {
      return { files: [] };
    }

    // Step 2: 确定对比的源和目标 ref（统一按 commit 处理）
    let oldRef: string | null = null;
    let newRef: string | null = null;
    if (subject.toLowerCase() !== 'commit') return { files: [] };
    if (!compareTarget) return { files: [] };
    oldRef = compareTarget;
    newRef = subjectID;

    // Step 3: 对每个文件进行内容对比（并行处理）
    const filePromises = changedFiles.map(async (file) => {
      const filePath = file.new_path || file.old_path;
      if (!filePath) {
        return { path: '', additions: [], deletions: [] };
      }

      try {
        // 并行获取新旧版本内容
        const [oldResult, newResult] = await Promise.all([
          // 获取旧版本内容
          !file.new_file && file.old_path
            ? this.getFileContent({
                repoID,
                sha: oldRef,
                filepath: file.old_path,
                provider,
                gitlabConfig,
              }).catch(() => ({ content: null }))
            : Promise.resolve({ content: null }),

          // 获取新版本内容
          !file.deleted_file && file.new_path
            ? this.getFileContent({
                repoID,
                sha: newRef,
                filepath: file.new_path,
                provider,
                gitlabConfig,
              }).catch(() => ({ content: null }))
            : Promise.resolve({ content: null }),
        ]);

        const oldContent = oldResult.content
          ? Buffer.from(oldResult.content, 'base64').toString('utf-8')
          : '';
        const newContent = newResult.content
          ? Buffer.from(newResult.content, 'base64').toString('utf-8')
          : '';

        // 使用 JS diff 计算差异行
        const { additions, deletions } = computeJSDiffLines(
          oldContent,
          newContent,
        );

        return {
          path: filePath,
          additions,
          deletions,
        };
      } catch (error) {
        // 对于单个文件的错误，记录但不影响其他文件的处理
        console.warn(`Failed to compute diff for file ${filePath}:`, error);
        return {
          path: filePath,
          additions: [],
          deletions: [],
        };
      }
    });

    const results = await Promise.all(filePromises);

    // 过滤掉空路径的结果
    const filteredResults = results.filter((result) => result.path !== '');
    return { files: filteredResults };
  }
}
