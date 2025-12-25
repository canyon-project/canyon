import type { CanyonBabelPluginConfig } from '../types';

/**
 * 从 CI/CD 环境变量中自动检测配置
 * 支持 GitLab CI 和 GitHub Actions
 */
export function detectCIConfig(): Partial<CanyonBabelPluginConfig> {
  const ciConfig: Partial<CanyonBabelPluginConfig> = {};

  // 检测是否在 CI 环境中
  const isCI = !!(
    process.env.CI ||
    process.env.GITLAB_CI ||
    process.env.GITHUB_ACTIONS
  );

  if (!isCI) {
    return ciConfig;
  }

  ciConfig.ci = true;

  // 检测 GitLab CI
  if (process.env.GITLAB_CI || process.env.CI_PROJECT_ID) {
    ciConfig.provider = 'gitlab';
    ciConfig.repoID =
      process.env.CI_PROJECT_ID || process.env.CI_PROJECT_PATH || '';
    ciConfig.sha = process.env.CI_COMMIT_SHA || '';
    ciConfig.branch =
      process.env.CI_COMMIT_BRANCH || process.env.CI_COMMIT_REF_NAME || '';
    ciConfig.buildProvider = 'gitlab';
    ciConfig.buildID =
      process.env.CI_PIPELINE_ID || process.env.CI_JOB_ID || '';
  }
  // 检测 GitHub Actions
  else if (process.env.GITHUB_ACTIONS || process.env.GITHUB_REPOSITORY) {
    ciConfig.provider = 'github';
    ciConfig.repoID =
      process.env.GITHUB_REPOSITORY_ID || process.env.GITHUB_REPOSITORY || '';
    ciConfig.sha = process.env.GITHUB_SHA || '';
    ciConfig.branch =
      process.env.GITHUB_REF_NAME ||
      process.env.GITHUB_REF?.replace(/^refs\/heads\//, '') ||
      '';
    ciConfig.buildProvider = 'github';
    ciConfig.buildID = process.env.GITHUB_RUN_ID || '';
  }

  return ciConfig;
}
