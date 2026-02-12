import type {
  ChangedFile,
  CommitInfo,
  CompareDiffItem,
  RepoInfo,
} from './types';

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

  /** 获取单次 commit 信息（parent_ids、stats），用于 diff 计算 */
  getCommitInfo(repoID: string, sha: string): Promise<CommitInfo>;

  /** 获取 compare 的完整 diffs 列表（含 old_path、new_path、new_file、deleted_file） */
  getCompareDiffs(
    repoID: string,
    from: string,
    to: string,
  ): Promise<CompareDiffItem[]>;

  /** 获取文件内容（指定 ref），返回解码后的字符串 */
  getFileContent(repoID: string, path: string, ref: string): Promise<string>;

  /**
   * 批量获取指定 ref 下多个文件的源码（通过 archive 下载后解压提取，避免逐文件请求）
   * @returns Map<相对路径, 文件内容 UTF-8 字符串>
   */
  getSourceFiles(
    repoID: string,
    sha: string,
    filePaths: string[],
  ): Promise<Map<string, string>>;
}
