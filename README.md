# Canyon

在 **Pull Request / Merge Request** 的测试 CI 中采集覆盖率：初始化 map、上报命中、异步生成快照并回溯到**源码级**覆盖率，再把概览写回检查状态。

文档站（`next` 分支自动部署）：https://canyon-project.github.io/canyon/

仓库：https://github.com/canyon-project/canyon

## 它解决什么问题

传统 Istanbul 报告多在本地或 CI artifact 里。Canyon 把流程产品化：

1. **构建期** `POST /coverage/map/init` — 上传语句地图 + inputSourceMap（内容寻址去重）
2. **测试期** `POST /coverage/client` — 按 tag（e2e / unit / env…）只上报命中 `s`
3. **汇总期** `POST /coverage/snapshot` — 服务端聚合、source map 回溯源码
4. **CI 轮询** `GET /coverage/snapshot/tasks/:taskId` — 拿到 coverage 后算语句覆盖率，回写 PR/MR

详细步骤与示例 workflow：文档 → [PR / MR CI 集成](https://canyon-project.github.io/canyon/guide/ci/overview.html)

## 仓库结构

| 目录 | 说明 |
| --- | --- |
| `services/api` | 覆盖率 API（Hono + Kysely + Postgres） |
| `packages/data` | `@canyon/data`：组装与源码回溯 |
| `apps/app` | 管理台（Coverage / 快照任务） |
| `apps/docs` | Rspress 文档 |
| `packages/real-app` | `@canyon/real-app` 插桩构建示例 |
| `e2e` | `@canyon/e2e` 仓库级端到端（API Vitest + Playwright） |

pnpm workspace + catalog，包管理器见根目录 `packageManager`。

## 快速开始

```bash
pnpm install

# API（需 Postgres，配置 services/api/.env 的 DATABASE_URL）
pnpm --filter api db:migrate
pnpm --filter api dev          # http://localhost:8080

# 管理台（代理 /api → :8080）
pnpm --filter app dev

# 文档
pnpm --filter docs dev
```

E2E（默认 `canyon_test`，**不会清库**；会先构建 `@canyon/real-app`）：

```bash
pnpm e2e
# 或仅 API 契约：pnpm --filter @canyon/e2e test:api
```

## 文档与 AI

- 在线文档：https://canyon-project.github.io/canyon/
- 本地文档：`pnpm --filter docs dev`
- 给编码 Agent 的项目速览：见 [AGENTS.md](./AGENTS.md)

## 许可

见仓库 LICENSE（若有）。
