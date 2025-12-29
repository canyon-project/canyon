/**
 * 数字映射类型，用于覆盖率数据
 */
export type NumMap = Record<string, number>;

/**
 * 覆盖率聚合组
 */
export interface GroupAgg {
  coverageID: string;
  versionID: string;
  filePath: string;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number>;
  latestTs: Date;
  inputSourceMap: number;
}

/**
 * 覆盖率聚合任务结果
 */
export interface TaskCoverageAggResult {
  processed: number;
  groups: number;
}

/**
 * 覆盖率删除任务结果
 */
export interface TaskCoverageDelResult {
  deleted: number;
}
