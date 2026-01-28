import { execSync } from 'node:child_process';
import type { CIEnv, GitDiffResult } from '../../types.js';
import { executeGitDiff } from '../../utils/git.js';
import { getGitHubEventBefore } from './event.js';

/**
 * GitHub Actions Provider
 */
export class GitHubProvider {
  constructor(private env: CIEnv) {}

  /**
   * 生成 GitHub 的 git diff
   */
  generateDiff(): GitDiffResult {
    // 先打印近5次 commit sha
    this.printRecentCommits();

    if (this.env.GITHUB_EVENT_NAME === 'pull_request') {
      return this.generatePRDiff();
    } else {
      return this.generatePushDiff();
    }
  }

  /**
   * 打印最近的 5 次 commit
   */
  private printRecentCommits(): void {
    try {
      const recentCommits = execSync('git log -5 --pretty=format:"%H"', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      const commitList = recentCommits.trim().split('\n').filter(Boolean);
      console.log('Recent 5 commits:');
      commitList.forEach((sha: string, index: number) => {
        console.log(`  ${index + 1}. ${sha}`);
      });
    } catch (error) {
      console.warn('Warning: Failed to get recent commits', error);
    }
  }

  /**
   * 生成 Pull Request 的 diff
   */
  private generatePRDiff(): GitDiffResult {
    console.log('GitHub PR diff');

    if (!this.env.GITHUB_BASE_REF) {
      throw new Error('GITHUB_BASE_REF is not set for pull request event');
    }

    const baseRef = this.env.GITHUB_BASE_REF;

    // 先 fetch 基础分支和所有引用
    try {
      execSync(
        'git fetch --no-tags --prune --depth=1 origin +refs/heads/*:refs/remotes/origin/*',
        {
          encoding: 'utf-8',
          stdio: 'inherit',
        },
      );
    } catch (error) {
      console.warn(`Warning: Failed to fetch origin branches`, error);
    }

    // 生成 diff：比较基础分支和当前 HEAD（PR 分支）
    const command = `git diff --unified=0 --no-color origin/${baseRef} HEAD`;
    const content = executeGitDiff(command);

    return { content, command };
  }

  /**
   * 生成 Push 事件的 diff
   */
  private generatePushDiff(): GitDiffResult {
    console.log('GitHub Commit diff');

    // 对于 push 事件，使用 github.event.before 和 github.sha
    const currentSha = this.env.GITHUB_SHA || 'HEAD';
    const beforeSha = getGitHubEventBefore();

    if (
      beforeSha &&
      beforeSha !== '0000000000000000000000000000000000000000'
    ) {
      // 先 fetch before SHA 和 current SHA
      try {
        execSync(`git fetch origin ${beforeSha}`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });
      } catch (error) {
        console.warn(`Warning: Failed to fetch origin ${beforeSha}`, error);
      }
      try {
        execSync(`git fetch origin ${currentSha}`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });
      } catch (error) {
        console.warn(`Warning: Failed to fetch origin ${currentSha}`, error);
      }

      // 使用 github.event.before 和 github.sha
      const command = `git diff --unified=0 --no-color ${beforeSha} ${currentSha}`;
      console.log('Command:', command);
      const content = executeGitDiff(command);

      return { content, command };
    } else {
      // fallback: 如果 before 不存在或是空 commit，尝试使用 SHA~1
      console.warn(
        'Warning: github.event.before not available, falling back to SHA~1',
      );
      const command = `git diff --unified=0 --no-color ${currentSha}~1 ${currentSha}`;
      console.log('Command:', command);
      try {
        const content = executeGitDiff(command);
        return { content, command };
      } catch (error) {
        // 如果 SHA~1 也不存在（比如第一次提交），返回空内容
        console.warn(
          'Warning: Previous commit does not exist, using empty diff',
        );
        return { content: '', command };
      }
    }
  }
}
