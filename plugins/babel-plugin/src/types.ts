/**
 * Babel plugin 配置接口
 */
export interface CanyonBabelPluginConfig {
  /** 仓库 ID */
  repoID?: string;
  /** Git commit SHA */
  sha?: string;
  /** Git 分支名 */
  branch?: string;
  /** Git 提供商 */
  provider?: string;
  /** 是否为 CI 环境 */
  ci?: boolean;
  /** 构建提供商 */
  buildProvider?: string;
  /** 构建 ID */
  buildID?: string;
}
