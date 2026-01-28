import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * CI 环境变量接口
 */
interface CIEnv {
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
 * 获取 CI 环境变量
 */
function getCIEnv(): CIEnv {
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
function detectCIPlatform(env: CIEnv): 'gitlab' | 'github' | 'unknown' {
  if (env.CI_PIPELINE_SOURCE !== undefined) {
    return 'gitlab';
  }
  if (env.GITHUB_EVENT_NAME !== undefined) {
    return 'github';
  }
  return 'unknown';
}

/**
 * 从 GitHub Actions event 文件中获取 before SHA
 * @returns before SHA，如果不存在则返回 null
 */
function getGitHubEventBefore(): string | null {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return null;
  }

  try {
    const eventContent = readFileSync(eventPath, 'utf-8');
    const event = JSON.parse(eventContent);
    // push 事件中有 before 字段
    return event.before || null;
  } catch (error) {
    console.warn('Warning: Failed to read GITHUB_EVENT_PATH', error);
    return null;
  }
}

/**
 * 执行 git diff 命令并返回结果
 */
function executeGitDiff(command: string): string {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return output;
  } catch (error: unknown) {
    // git diff 在有差异时会返回退出码 1，这是正常的
    // 我们需要从错误对象中获取 stdout
    if (error && typeof error === 'object' && 'status' in error) {
      const execError = error as {
        status?: number;
        stdout?: string | Buffer;
        stderr?: string | Buffer;
      };

      // 退出码 1 表示有差异，这是正常的，返回 stdout
      if (execError.status === 1) {
        const stdout = execError.stdout;
        if (typeof stdout === 'string') {
          return stdout;
        }
        if (Buffer.isBuffer(stdout)) {
          return stdout.toString('utf-8');
        }
        return '';
      }

      // 退出码 128 通常表示 git 错误，如 "bad object"
      // 尝试 fetch 缺失的 commit 后重试
      if (execError.status === 128) {
        const stderr = execError.stderr;
        const errorMessage =
          typeof stderr === 'string'
            ? stderr
            : Buffer.isBuffer(stderr)
              ? stderr.toString('utf-8')
              : 'Unknown git error';

        // 检查是否是 "bad object" 错误
        if (errorMessage.includes('bad object')) {
          // 从命令中提取 commit SHA
          const shaMatches = command.matchAll(/\b([a-f0-9]{40})\b/g);
          const shas = Array.from(shaMatches, (m) => m[1]);

          // 尝试 fetch 所有涉及的 commit
          for (const sha of shas) {
            try {
              console.log(`Attempting to fetch commit ${sha}...`);
              execSync(`git fetch origin ${sha}`, {
                encoding: 'utf-8',
                stdio: 'inherit',
              });
            } catch (fetchError) {
              console.warn(
                `Warning: Failed to fetch commit ${sha}`,
                fetchError,
              );
            }
          }

          // 重试 git diff
          try {
            const retryOutput = execSync(command, {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe'],
              maxBuffer: 10 * 1024 * 1024,
            });
            return retryOutput;
          } catch (retryError: unknown) {
            // 如果重试仍然失败，检查是否是正常的差异（退出码 1）
            if (
              retryError &&
              typeof retryError === 'object' &&
              'status' in retryError
            ) {
              const retryExecError = retryError as {
                status?: number;
                stdout?: string | Buffer;
              };
              if (retryExecError.status === 1) {
                const stdout = retryExecError.stdout;
                if (typeof stdout === 'string') {
                  return stdout;
                }
                if (Buffer.isBuffer(stdout)) {
                  return stdout.toString('utf-8');
                }
              }
            }
            // 如果重试后仍然失败，抛出原始错误
            throw error;
          }
        }

        // 其他 git 错误直接抛出
        throw error;
      }

      // 其他错误需要抛出
      throw error;
    }
    throw error;
  }
}

/**
 * 生成 git diff 文件
 * @param outputPath 输出文件路径，默认为当前目录下的 diff.txt
 */
export async function generateGitDiff(outputPath?: string): Promise<void> {
  const env = getCIEnv();
  const platform = detectCIPlatform(env);
  const output = outputPath || resolve(process.cwd(), 'diff.txt');

  let diffContent = '';
  let command = '';

  if (platform === 'gitlab') {
    // GitLab CI 逻辑
    if (env.CI_PIPELINE_SOURCE === 'merge_request_event') {
      console.log('GitLab MR diff');

      if (!env.CI_MERGE_REQUEST_DIFF_BASE_SHA) {
        throw new Error(
          'CI_MERGE_REQUEST_DIFF_BASE_SHA is not set for merge request event',
        );
      }

      // 获取 base SHA
      const baseSha = env.CI_MERGE_REQUEST_DIFF_BASE_SHA;

      // 先 fetch base SHA
      try {
        execSync(`git fetch origin ${baseSha}`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });
      } catch (error) {
        console.warn(`Warning: Failed to fetch origin ${baseSha}`, error);
      }

      // 生成 diff
      command = `git diff --unified=0 --no-color ${baseSha} HEAD`;
      diffContent = executeGitDiff(command);
    } else {
      console.log('GitLab Commit diff');

      // 对于 commit 事件，比较 HEAD~1 和 HEAD
      command = 'git diff --unified=0 --no-color HEAD~1 HEAD';

      try {
        diffContent = executeGitDiff(command);
      } catch (error) {
        // 如果 HEAD~1 不存在（比如第一次提交），返回空内容
        console.warn('Warning: HEAD~1 does not exist, using empty diff');
        diffContent = '';
      }
    }
  } else if (platform === 'github') {
    // GitHub Actions 逻辑
    // 先打印近5次 commit sha
    try {
      const recentCommits = execSync('git log -5 --pretty=format:"%H"', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      const commitList = recentCommits.trim().split('\n').filter(Boolean);
      console.log('Recent 5 commits:');
      commitList.forEach((sha: string, index: number) => {
        console.log(`  ${index + 1}. ${sha}`);
      });
    } catch (error) {
      console.warn('Warning: Failed to get recent commits', error);
    }

    if (env.GITHUB_EVENT_NAME === 'pull_request') {
      console.log('GitHub PR diff');

      if (!env.GITHUB_BASE_REF) {
        throw new Error('GITHUB_BASE_REF is not set for pull request event');
      }

      const baseRef = env.GITHUB_BASE_REF;

      // 先 fetch 基础分支和所有引用
      try {
        execSync(
          'git fetch --no-tags --prune --depth=1 origin +refs/heads/*:refs/remotes/origin/*',
          {
            encoding: 'utf-8',
            stdio: 'inherit',
          },
        );
      } catch (error) {
        console.warn(`Warning: Failed to fetch origin branches`, error);
      }

      // 生成 diff：比较基础分支和当前 HEAD（PR 分支）
      command = `git diff --unified=0 --no-color origin/${baseRef} HEAD`;
      diffContent = executeGitDiff(command);
    } else {
      console.log('GitHub Commit diff');

      // 对于 push 事件，使用 github.event.before 和 github.sha
      const currentSha = env.GITHUB_SHA || 'HEAD';
      const beforeSha = getGitHubEventBefore();

      if (
        beforeSha &&
        beforeSha !== '0000000000000000000000000000000000000000'
      ) {
        // 先 fetch before SHA 和 current SHA
        try {
          execSync(`git fetch origin ${beforeSha}`, {
            encoding: 'utf-8',
            stdio: 'inherit',
          });
        } catch (error) {
          console.warn(`Warning: Failed to fetch origin ${beforeSha}`, error);
        }
        try {
          execSync(`git fetch origin ${currentSha}`, {
            encoding: 'utf-8',
            stdio: 'inherit',
          });
        } catch (error) {
          console.warn(`Warning: Failed to fetch origin ${currentSha}`, error);
        }

        // 使用 github.event.before 和 github.sha
        command = `git diff --unified=0 --no-color ${beforeSha} ${currentSha}`;
        console.log('Command:', command);
        diffContent = executeGitDiff(command);
      } else {
        // fallback: 如果 before 不存在或是空 commit，尝试使用 SHA~1
        console.warn(
          'Warning: github.event.before not available, falling back to SHA~1',
        );
        command = `git diff --unified=0 --no-color ${currentSha}~1 ${currentSha}`;
        console.log('Command:', command);
        try {
          diffContent = executeGitDiff(command);
        } catch (error) {
          // 如果 SHA~1 也不存在（比如第一次提交），返回空内容
          console.warn(
            'Warning: Previous commit does not exist, using empty diff',
          );
          diffContent = '';
        }
      }
    }
  } else {
    // 未知平台，使用默认逻辑
    console.log('Unknown CI platform, using default commit diff');
    command = 'git diff --unified=0 --no-color HEAD~1 HEAD';

    try {
      diffContent = executeGitDiff(command);
    } catch (error) {
      console.warn('Warning: HEAD~1 does not exist, using empty diff');
      diffContent = '';
    }
  }

  // 写入文件
  writeFileSync(output, diffContent, 'utf-8');
  console.log(`Git diff written to: ${output}`);
}

/**
 * 获取并打印版本信息
 */
function printVersion(): void {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    console.log(`${packageJson.name} v${packageJson.version}`);
  } catch (error) {
    console.warn('Warning: Failed to read version from package.json', error);
  }
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
