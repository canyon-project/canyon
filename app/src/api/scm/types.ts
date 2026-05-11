export type ScmType = "github" | "gitlab";

/** GitLab 需 base + token，GitHub 仅需 token（base 固定为 api.github.com） */
export type ScmConfig =
  | { type: "gitlab"; base: string; token: string }
  | { type: "github"; token: string };

export interface RepoInfo {
  /** 平台返回的仓库 ID（如 GitLab project id、GitHub repo id），String(data.id) */
  id: string;
  pathWithNamespace: string;
  description: string;
}

export interface ChangedFile {
  path: string;
  status?: "added" | "modified" | "removed";
}

export interface CommitInfo {
  parent_ids: string[];
  stats: { additions: number };
}

/** 从 SCM API 拉取的完整 commit 实体，用于存储到 DB */
export interface CommitDetail {
  sha: string;
  provider: string;
  repoID: string;
  commitMessage: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  [key: string]: unknown;
}
