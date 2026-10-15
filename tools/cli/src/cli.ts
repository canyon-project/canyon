import { parseArgs } from "node:util";
import { collectGithubPipelineEnv } from "./collect-github-env.js";

const HELP = `用法: canyon-gha-vars [选项]

在 GitHub Actions 中打印流水线 / Runner 相关环境变量（GITHUB_*、RUNNER_*、CI 等）。

选项:
  -f, --format <json|table>  输出格式（默认 json）
  -h, --help                 显示帮助
`;

const { values } = parseArgs({
  options: {
    format: { type: "string", short: "f", default: "json" },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: false,
});

if (values.help) {
  console.log(HELP.trim());
  process.exit(0);
}

const format = values.format ?? "json";
const vars = collectGithubPipelineEnv();

if (format === "table") {
  for (const [key, value] of Object.entries(vars)) {
    console.log(`${key}=${value}`);
  }
} else if (format === "json") {
  console.log(JSON.stringify(vars, null, 2));
} else {
  console.error(`未知格式: ${format}，请使用 json 或 table`);
  process.exit(1);
}
