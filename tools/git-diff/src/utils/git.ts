import { execSync } from 'node:child_process';

/**
 * 执行 git diff 命令并返回结果
 */
export function executeGitDiff(command: string): string {
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
