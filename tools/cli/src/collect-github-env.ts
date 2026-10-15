/**
 * 判断是否为 GitHub Actions 流水线 / Runner 注入的环境变量键名。
 * 参考：https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
 */
export function isGithubPipelineEnvKey(key: string): boolean {
  if (key === "CI" || key === "ImageOS") return true;
  if (
    key.startsWith("GITHUB_") ||
    key.startsWith("RUNNER_") ||
    key.startsWith("ACTIONS_")
  ) {
    return true;
  }
  return false;
}

/** 从 process.env 收集并按键名排序 */
export function collectGithubPipelineEnv(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;
    if (isGithubPipelineEnvKey(key)) {
      out[key] = value;
    }
  }
  return Object.fromEntries(
    Object.keys(out)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => [k, out[k]!]),
  );
}
