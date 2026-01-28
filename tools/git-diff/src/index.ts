import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GitHubProvider } from './providers/github/index.js';
import { GitLabProvider } from './providers/gitlab/index.js';
import { UnknownProvider } from './providers/unknown/index.js';
import { detectCIPlatform, getCIEnv } from './utils/ci.js';
import { printVersion } from './utils/version.js';

/**
 * 生成 git diff 文件
 * @param outputPath 输出文件路径，默认为当前目录下的 diff.txt
 */
export async function generateGitDiff(outputPath?: string): Promise<void> {
  const env = getCIEnv();
  const platform = detectCIPlatform(env);
  const output = outputPath || resolve(process.cwd(), 'diff.txt');

  let result;

  if (platform === 'gitlab') {
    const provider = new GitLabProvider(env);
    result = provider.generateDiff();
  } else if (platform === 'github') {
    const provider = new GitHubProvider(env);
    result = provider.generateDiff();
  } else {
    const provider = new UnknownProvider();
    result = provider.generateDiff();
  }

  // 写入文件
  writeFileSync(output, result.content, 'utf-8');
  console.log(`Git diff written to: ${output}`);
}

/**
 * CLI 入口
 */
export async function main(): Promise<void> {
  printVersion();

  try {
    const args = process.argv.slice(2);
    const outputIndex = args.indexOf('--output');
    const outputPath =
      outputIndex !== -1 && args[outputIndex + 1]
        ? args[outputIndex + 1]
        : undefined;

    await generateGitDiff(outputPath);
    process.exit(0);
  } catch (error) {
    console.error('Error generating git diff:', error);
    process.exit(1);
  }
}
