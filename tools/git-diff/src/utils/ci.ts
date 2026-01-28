import type { CIEnv, CIPlatform } from '../types.js';

/**
 * 获取 CI 环境变量
 */
export function getCIEnv(): CIEnv {
  return {
    // GitLab CI
    CI_PIPELINE_SOURCE: process.env.CI_PIPELINE_SOURCE,
    CI_MERGE_REQUEST_DIFF_BASE_SHA: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA,
    CI_COMMIT_SHA: process.env.CI_COMMIT_SHA,
    CI_COMMIT_REF_NAME: process.env.CI_COMMIT_REF_NAME,
    // GitHub Actions
    GITHUB_EVENT_NAME: process.env.GITHUB_EVENT_NAME,
    GITHUB_BASE_REF: process.env.GITHUB_BASE_REF,
    GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
    GITHUB_SHA: process.env.GITHUB_SHA,
    GITHUB_REF: process.env.GITHUB_REF,
  };
}

/**
 * 检测当前使用的 CI 平台
 */
export function detectCIPlatform(env: CIEnv): CIPlatform {
  if (env.CI_PIPELINE_SOURCE !== undefined) {
    return 'gitlab';
  }
  if (env.GITHUB_EVENT_NAME !== undefined) {
    return 'github';
  }
  return 'unknown';
}
