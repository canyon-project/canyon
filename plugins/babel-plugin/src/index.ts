/// <reference types="node" />
import { declare } from '@babel/helper-plugin-utils';
import { detectCIConfig } from './helpers/detect-ci-config';
import type { CanyonBabelPluginConfig } from './types';
import { visitorProgramExit } from './visitor-program-exit';

/**
 * 默认配置对象
 */
const defaultConfig: Required<CanyonBabelPluginConfig> = {
  repoID: '',
  sha: '',
  branch: '',
  provider: '',
  ci: false,
  buildProvider: '',
  buildID: '',
};

/**
 * 合并用户配置、CI 自动检测配置和默认配置
 */
function mergeConfig(
  config: CanyonBabelPluginConfig | undefined,
): Required<CanyonBabelPluginConfig> {
  // 首先从 CI 环境变量中自动检测配置
  const ciConfig = detectCIConfig();

  // 合并优先级：用户配置 > CI 自动检测 > 默认配置
  return {
    repoID: config?.repoID ?? ciConfig.repoID ?? defaultConfig.repoID,
    sha: config?.sha ?? ciConfig.sha ?? defaultConfig.sha,
    branch: config?.branch ?? ciConfig.branch ?? defaultConfig.branch,
    provider: config?.provider ?? ciConfig.provider ?? defaultConfig.provider,
    ci: config?.ci ?? ciConfig.ci ?? defaultConfig.ci,
    buildProvider:
      config?.buildProvider ??
      ciConfig.buildProvider ??
      defaultConfig.buildProvider,
    buildID: config?.buildID ?? ciConfig.buildID ?? defaultConfig.buildID,
  };
}

export default declare((api, config: unknown) => {
  api.assertVersion(7);
  const userConfig = config as CanyonBabelPluginConfig | undefined;
  const validatedConfig = mergeConfig(userConfig);
  return {
    visitor: {
      Program: {
        exit: (path) => {
          visitorProgramExit(api, path, validatedConfig, validatedConfig);
        },
      },
    },
  };
});
