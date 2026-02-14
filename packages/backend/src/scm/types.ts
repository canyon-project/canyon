export type ScmType = 'github' | 'gitlab';

/** GitLab 需 base + token，GitHub 仅需 token（base 固定为 api.github.com） */
export type ScmConfig =
  | { type: 'gitlab'; base: string; token: string }
  | { type: 'github'; token: string };

export interface RepoInfo {
  /** 平台返回的仓库 ID（如 GitLab project id、GitHub repo id），String(data.id) */
  id: string;
  pathWithNamespace: string;
  description: string;
}

export interface ChangedFile {
  path: string;
  status?: 'added' | 'modified' | 'removed';
}

/** 用于 diff 的 compare 单项 */
export interface CompareDiffItem {
  old_path?: string;
  new_path?: string;
  new_file?: boolean;
  deleted_file?: boolean;
}

export interface CommitInfo {
  parent_ids: string[];
  stats: { additions: number };
}
