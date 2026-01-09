import { createHash } from 'node:crypto';
import stringify from 'json-stable-stringify';
import type { CanyonBabelPluginConfig } from '../types';

/**
 * 生成 buildHash
 * 基于 provider, repoID, sha, buildTarget 四个字段生成稳定的构建身份标识
 *
 * @param config - 插件配置参数
 * @returns buildHash 字符串
 */
export function generateBuildHash(
  config: Required<CanyonBabelPluginConfig>,
): string {
  // buildHash 包含这些核心字段：
  // provider + repoID + sha + buildTarget + instrumentCwd
  const buildHashFields: Record<string, string> = {
    provider: config.provider || '',
    repoID: config.repoID || '',
    sha: config.sha || '',
    buildTarget: config.buildTarget || '',
    instrumentCwd: config.instrumentCwd || '',
  };

  // 使用 json-stable-stringify 确保键顺序稳定，与后端保持一致
  const hash = createHash('sha1')
    .update(stringify(buildHashFields) || '')
    .digest('hex');

  return hash;
}
