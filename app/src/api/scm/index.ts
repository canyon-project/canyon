import type { ScmAdapter } from "./adapter.ts";
import type { ScmConfig } from "./types.ts";
import { GithubAdapter } from "./github.ts";
import { GitlabAdapter } from "./gitlab.ts";

export type { ScmAdapter } from "./adapter.ts";
export type { ScmConfig, ScmType, RepoInfo, ChangedFile } from "./types.ts";
export { GithubAdapter } from "./github.ts";
export { GitlabAdapter } from "./gitlab.ts";

/**
 * 工厂：根据 config.type 返回对应的 SCM 适配器，业务层只依赖 ScmAdapter 接口。
 * @example
 * const scm = createScmAdapter(config)
 * await scm.getRepoInfo(repoID)
 * await scm.getChangedFiles(repoID, base, head)
 */
export function createScmAdapter(config: ScmConfig): ScmAdapter {
  switch (config.type) {
    case "github":
      return new GithubAdapter(config);
    case "gitlab":
      return new GitlabAdapter(config);
    default:
      throw new Error(`Unsupported SCM: ${(config as { type?: string }).type}`);
  }
}
