export type ScmType = 'github' | 'gitlab';

/** GitLab 需 base + token，GitHub 仅需 token（base 固定为 api.github.com） */
export type ScmConfig =
  | { type: 'gitlab'; base: string; token: string }
  | { type: 'github'; token: string };

export interface RepoInfo {
  pathWithNamespace: string;
  description: string;
}

export interface ChangedFile {
  path: string;
  status?: 'added' | 'modified' | 'removed';
}
