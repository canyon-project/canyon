import type { ScmAdapter } from './adapter';
import type { ScmConfig } from './types';
import { GithubAdapter } from './github';
import { GitlabAdapter } from './gitlab';

export type { ScmAdapter } from './adapter';
export type { ScmConfig, ScmType, RepoInfo, ChangedFile } from './types';
export { GithubAdapter } from './github';
export { GitlabAdapter } from './gitlab';

/**
 * 工厂：根据 config.type 返回对应的 SCM 适配器，业务层只依赖 ScmAdapter 接口。
 * @example
 * const scm = createScmAdapter(config)
 * await scm.getRepoInfo(repoID)
 * await scm.getChangedFiles(repoID, base, head)
 */
export function createScmAdapter(config: ScmConfig): ScmAdapter {
  switch (config.type) {
    case 'github':
      return new GithubAdapter(config);
    case 'gitlab':
      return new GitlabAdapter(config);
    default:
      throw new Error(`Unsupported SCM: ${(config as { type?: string }).type}`);
  }
}
