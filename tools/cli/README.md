# @canyon/cli

用 [tsdown](https://tsdown.dev/) 打包的 Node 命令行工具，用于在 CI 中列出 GitHub Actions / Runner 注入的环境变量（`GITHUB_*`、`RUNNER_*`、`ACTIONS_*`、`CI` 等）。

## 开发

```bash
pnpm --filter @canyon/cli build
pnpm --filter @canyon/cli start
# 或表格输出
node tools/cli/dist/cli.mjs --format table
```

## 在 workflow 中使用

构建后执行 `node tools/cli/dist/cli.mjs` 或 `pnpm exec canyon-gha-vars`（需在包目录或已 link 的 monorepo 根目录）。
