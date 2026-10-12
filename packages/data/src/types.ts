/** 仪器侧单文件覆盖率（组装后、回溯前） */
export type InstrumentFileCoverage = {
  path: string;
  statementMap: Record<string, unknown>;
  fnMap: Record<string, unknown>;
  branchMap: Record<string, unknown>;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, unknown>;
  inputSourceMap?: unknown;
  buildHash?: string;
};

/** 快照落库结构：源码路径 + 语句命中 */
export type SnapshotFileCoverage = {
  path: string;
  s: Record<string, number>;
  buildHash: string;
};

/** 从 DB 拼装仪器覆盖率的输入行 */
export type AssembleFileInput = {
  path: string;
  statementMap: unknown;
  s: unknown;
  inputSourceMap?: unknown | null;
  buildHash: string;
};
