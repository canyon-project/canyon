/**
 * Babel plugin 配置接口
 */
export interface CanyonBabelPluginConfig {
  /** 仓库 ID */
  repoID?: string;
  /** Git commit SHA */
  sha?: string;
  /** Git 提供商 */
  provider?: string;
  /** 构建目标 */
  buildTarget?: string;
  /** 是否为 CI 环境 */
  ci?: boolean;
  /** 插桩工作目录，默认为当前路径 */
  instrumentCwd?: string;
  keepMap?: boolean;
}
