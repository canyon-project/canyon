import type { ChangedFile, CommitDetail, CommitInfo, CompareDiffItem } from "./types.ts";

/**
 * SCM 适配器接口：业务层只依赖此接口，通过 createScmAdapter 获取具体实现。
 */
export interface ScmAdapter {

  /** 获取 base..head 之间变更的文件列表 */
  getChangedFiles(repoID: string, base: string, head: string): Promise<ChangedFile[]>;

  /** 获取 from..to 之间的 commit sha 列表（含 from、to，按时间从旧到新） */
  getCommitsBetween(repoID: string, fromSha: string, toSha: string): Promise<string[]>;

  /** 获取单次 commit 信息（parent_ids、stats），用于 diff 计算 */
  getCommitInfo(repoID: string, sha: string): Promise<CommitInfo>;

  /**
   * 获取单次 commit 完整实体（从 GitLab/GitHub API），用于存储到 DB。
   * 返回包含 sha、commitMessage、authorName、authorEmail、createdAt 等字段。
   */
  getCommitDetail(repoID: string, sha: string, provider: string): Promise<CommitDetail>;

  /** 获取 compare 的完整 diffs 列表（含 old_path、new_path、new_file、deleted_file） */
  getCompareDiffs(repoID: string, from: string, to: string): Promise<CompareDiffItem[]>;

  /** 获取文件内容（指定 ref），返回解码后的字符串 */
  getFileContent(repoID: string, path: string, ref: string): Promise<string>;

  /**
   * 批量获取指定 ref 下多个文件的源码（通过 archive 下载后解压提取，避免逐文件请求）
   * @returns Map<相对路径, 文件内容 UTF-8 字符串>
   */
  getSourceFiles(repoID: string, sha: string, filePaths: string[]): Promise<Map<string, string>>;
}
