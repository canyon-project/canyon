import type { ConfigAPI, NodePath } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type * as t from '@babel/types';
import { detectCIConfig } from './helpers/detect-ci-config';
import type { CanyonBabelPluginConfig } from './types';
import { visitorProgramExit } from './visitor-program-exit';

/**
 * 默认配置对象
 */
const defaultConfig: Required<CanyonBabelPluginConfig> = {
  repoID: '',
  sha: '',
  provider: '',
  buildTarget: '',
  ci: false,
  instrumentCwd: process.cwd(),
  keepMap: false,
};

/**
 * 合并用户配置、CI 自动检测配置和默认配置
 *
 * @param config - 用户提供的配置
 * @returns 合并后的完整配置对象
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
    // branch: config?.branch ?? ciConfig.branch ?? defaultConfig.branch,
    provider: config?.provider ?? ciConfig.provider ?? defaultConfig.provider,
    buildTarget:
      config?.buildTarget ?? ciConfig.buildTarget ?? defaultConfig.buildTarget,
    ci: config?.ci ?? ciConfig.ci ?? defaultConfig.ci,
    instrumentCwd: config?.instrumentCwd ?? defaultConfig.instrumentCwd,
    keepMap: config?.keepMap ?? defaultConfig.keepMap,
    // buildProvider:
    //   config?.buildProvider ??
    //   ciConfig.buildProvider ??
    //   defaultConfig.buildProvider,
    // buildID: config?.buildID ?? ciConfig.buildID ?? defaultConfig.buildID,
  };
}

/**
 * Babel 插件主入口
 * 用于在代码中注入覆盖率收集逻辑和元数据
 */
export default declare(
  (
    api: ConfigAPI,
    config: unknown,
  ): {
    visitor: { Program: { exit: (path: NodePath<t.Program>) => void } };
  } => {
    api.assertVersion(7);
    const userConfig = config as CanyonBabelPluginConfig | undefined;
    const validatedConfig = mergeConfig(userConfig);
    return {
      visitor: {
        Program: {
          exit: (programPath: NodePath<t.Program>) => {
            visitorProgramExit(api, programPath, validatedConfig);
          },
        },
      },
    };
  },
);
