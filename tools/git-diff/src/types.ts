/**
 * CI 环境变量接口
 */
export interface CIEnv {
  // GitLab CI
  CI_PIPELINE_SOURCE?: string;
  CI_MERGE_REQUEST_DIFF_BASE_SHA?: string;
  CI_COMMIT_SHA?: string;
  CI_COMMIT_REF_NAME?: string;
  // GitHub Actions
  GITHUB_EVENT_NAME?: string;
  GITHUB_BASE_REF?: string;
  GITHUB_HEAD_REF?: string;
  GITHUB_SHA?: string;
  GITHUB_REF?: string;
}

/**
 * CI 平台类型
 */
export type CIPlatform = 'gitlab' | 'github' | 'unknown';

/**
 * Git diff 结果
 */
export interface GitDiffResult {
  content: string;
  command: string;
}

/**
 * Diff 映射表，键为文件路径，值为变更行号信息
 */
export interface DiffMap {
  [filePath: string]: {
    additions: number[];
    deletions: number[];
  };
}

/**
 * Diff 数组项，包含文件路径和变更行号信息
 */
export interface DiffItem {
  path: string;
  additions: number[];
  deletions: number[];
}
