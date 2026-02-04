import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import parseDiff from 'parse-diff';
import { GitHubProvider } from './providers/github/index.js';
import { GitLabProvider } from './providers/gitlab/index.js';
import { UnknownProvider } from './providers/unknown/index.js';
import type { DiffItem } from './types.js';
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

  // 写入 diff.txt 文件
  writeFileSync(output, result.content, 'utf-8');
  console.log(`Git diff written to: ${output}`);

  // 解析 diff 并生成 diff.json 文件
  const diffMap = parseDiffToMap(result.content);
  const diffJsonPath = output.replace(/\.txt$/, '.json');
  writeFileSync(diffJsonPath, JSON.stringify(diffMap, null, 2), 'utf-8');
  console.log(`Git diff JSON written to: ${diffJsonPath}`);
}

/**
 * 解析 diff 文本为数组格式
 * @param diff diff 文本内容
 * @returns DiffItem 数组
 */
function parseDiffToMap(diff: string): DiffItem[] {
  if (!diff) {
    return [];
  }

  const parsedFiles = parseDiff(diff);
  const diffArray: DiffItem[] = [];

  parsedFiles.forEach((file: any) => {
    const filePath = file.to;
    if (!filePath) return;

    const additions: number[] = [];
    const deletions: number[] = [];

    file.chunks.forEach((chunk: any) => {
      chunk.changes.forEach((change: any) => {
        if (change.type === 'add' && change.ln) {
          additions.push(change.ln);
        }
        if (change.type === 'del' && change.ln) {
          deletions.push(change.ln);
        }
      });
    });

    if (additions.length > 0 || deletions.length > 0) {
      diffArray.push({
        path: filePath,
        additions,
        deletions,
      });
    }
  });

  return diffArray;
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
