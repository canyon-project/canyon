import type { GitDiffResult } from '../../types.js';
import { executeGitDiff } from '../../utils/git.js';

/**
 * Unknown CI Platform Provider
 */
export class UnknownProvider {
  /**
   * 生成默认的 git diff（使用 HEAD~1 HEAD）
   */
  generateDiff(): GitDiffResult {
    console.log('Unknown CI platform, using default commit diff');
    const command = 'git diff --unified=0 --no-color HEAD~1 HEAD';

    try {
      const content = executeGitDiff(command);
      return { content, command };
    } catch (error) {
      console.warn('Warning: HEAD~1 does not exist, using empty diff');
      return { content: '', command };
    }
  }
}
