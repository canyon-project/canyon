/**
 * 覆盖率数据接口
 */
export interface CoverageData {
  path?: string;
  statementMap?: Record<string, unknown>;
  fnMap?: Record<string, unknown>;
  branchMap?: Record<string, unknown>;
  inputSourceMap?: unknown;
  contentHash?: string;
  [key: string]: unknown;
}
