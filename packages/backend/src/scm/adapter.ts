import type { ChangedFile, RepoInfo } from './types';

/**
 * SCM 适配器接口：业务层只依赖此接口，通过 createScmAdapter 获取具体实现。
 */
export interface ScmAdapter {
  /** 获取仓库信息（pathWithNamespace、description） */
  getRepoInfo(repoID: string): Promise<RepoInfo>;

  /** 获取 base..head 之间变更的文件列表 */
  getChangedFiles(
    repoID: string,
    base: string,
    head: string,
  ): Promise<ChangedFile[]>;
}
