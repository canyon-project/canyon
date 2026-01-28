import { execSync } from 'node:child_process';
import type { CIEnv, GitDiffResult } from '../../types.js';
import { executeGitDiff } from '../../utils/git.js';

/**
 * GitLab CI Provider
 */
export class GitLabProvider {
  constructor(private env: CIEnv) {}

  /**
   * 生成 GitLab 的 git diff
   */
  generateDiff(): GitDiffResult {
    if (this.env.CI_PIPELINE_SOURCE === 'merge_request_event') {
      return this.generateMRDiff();
    } else {
      return this.generateCommitDiff();
    }
  }

  /**
   * 生成 Merge Request 的 diff
   */
  private generateMRDiff(): GitDiffResult {
    console.log('GitLab MR diff');

    if (!this.env.CI_MERGE_REQUEST_DIFF_BASE_SHA) {
      throw new Error(
        'CI_MERGE_REQUEST_DIFF_BASE_SHA is not set for merge request event',
      );
    }

    // 获取 base SHA
    const baseSha = this.env.CI_MERGE_REQUEST_DIFF_BASE_SHA;

    // 先 fetch base SHA
    try {
      execSync(`git fetch origin ${baseSha}`, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn(`Warning: Failed to fetch origin ${baseSha}`, error);
    }

    // 生成 diff
    const command = `git diff --unified=0 --no-color ${baseSha} HEAD`;
    const content = executeGitDiff(command);

    return { content, command };
  }

  /**
   * 生成 Commit 的 diff
   */
  private generateCommitDiff(): GitDiffResult {
    console.log('GitLab Commit diff');

    // 对于 commit 事件，比较 HEAD~1 和 HEAD
    const command = 'git diff --unified=0 --no-color HEAD~1 HEAD';

    try {
      const content = executeGitDiff(command);
      return { content, command };
    } catch (error) {
      // 如果 HEAD~1 不存在（比如第一次提交），返回空内容
      console.warn('Warning: HEAD~1 does not exist, using empty diff');
      return { content: '', command };
    }
  }
}
