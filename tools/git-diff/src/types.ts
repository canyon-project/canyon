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
