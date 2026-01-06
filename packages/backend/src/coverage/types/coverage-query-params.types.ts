import { Provider } from '../../types';

/**
 * 覆盖率查询参数
 */
export interface CoverageQueryParamsTypes {
  /** 代码托管平台提供商 */
  provider: Provider;
  /** 仓库标识符 */
  repoID: string;
  /** Git commit SHA */
  sha: string;
  /** 构建目标（可选） */
  buildTarget?: string;
  /** 报告提供商（可选） */
  reportProvider?: string;
  /** 报告ID（可选） */
  reportID?: string;
  /** 文件路径（可选） */
  filePath?: string;
}
