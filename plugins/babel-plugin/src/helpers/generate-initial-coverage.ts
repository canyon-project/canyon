import type { CanyonBabelPluginConfig } from '../types';
import { extractCoverageData } from './extract-coverage-data';

/**
 * 覆盖率数据接口
 */
interface CoverageData {
  path?: string;
  [key: string]: unknown;
}

/**
 * 生成初始覆盖率数据
 *
 * @param sourceCode - 源代码内容
 * @param _config - 插件配置参数（当前未使用，保留以兼容接口）
 * @returns 提取的覆盖率数据对象，如果提取失败则返回 null
 */
export function generateInitialCoverage(
  sourceCode: string,
  _config: Required<CanyonBabelPluginConfig>,
): CoverageData | null {
  const coverageData = extractCoverageData(sourceCode);
  return coverageData;
}
