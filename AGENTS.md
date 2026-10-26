# Canyon — Agent 指南

我英文不好，**注释、文档、用户可见文案用中文**；代码标识符用英文。

## 项目是什么

覆盖率平台：在 PR/MR 的 test CI 里完成 **map 初始化 → hit 上报 → 异步快照 → 轮询 → 源码级覆盖率概览**，再回写检查状态。

核心链路文档：`apps/docs/docs/guide/ci/overview.mdx`（本地 `pnpm --filter docs dev`）。

## 仓库结构（pnpm workspace）

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| `services/api` | `api` | Hono + Kysely + Postgres；覆盖率 API、快照任务 |
| `packages/data` | `@canyon/data` | 组装 map/hit/sourcemap；`remapToSourceSnapshot` 回溯源码 |
| `apps/app` | `app` | Ant Design 管理台（Coverage 列表 / 快照任务） |
| `apps/docs` | `docs` | Rspress 文档；`next` 分支部署 GitHub Pages |
| `packages/real-app` | `@canyon/real-app` | 插桩构建示例，产出 `.canyon_output` |
| `e2e` | `@canyon/e2e` | 仓库级 e2e（Vitest API + Playwright 真实项目） |

## 数据模型（务必先理解）

- **Map / Hit 分离**：`map/init` 存 `statement_map` + 内容寻址 `input_source_map`；`client` **只 insert hit（`s`）**，不做合并。
- **buildHash**：一次可对齐构建的主键；须先 init 再 client。
- **tag**：`{ source, type, env, trigger }` → `tagKey = sha256(stableStringify(...))`；快照可按 jsonb `@>` 筛选。
- **快照任务**：压缩同 build+tagKey+file 的多行 hit → 拼 map/sourcemap → `@canyon/data` 回溯 → 写 `snapshot.coverage`（源码 path + `s`）。
- **锁**：同 `buildHash` 同时只允许一个 `running` 快照；Postgres advisory lock + 任务状态。

表前缀：`canyon_next6_*`（coverage / map / input_source_map / tag / hit / snapshot_task / snapshot）。

## 主要 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/coverage/map/init` | 写 map |
| POST | `/coverage/client` | 上报 hit + tag |
| POST | `/coverage/snapshot` | 创建任务 `202`；同 build 已 running → `409` |
| GET | `/coverage/snapshot/tasks/:taskId` | 轮询；`succeeded` 带 `coverage` |
| GET | `/coverage/builds` | 管理台列表 |
| GET | `/coverage/builds/:buildHash/snapshot-tasks` | 某 build 的任务列表 |

环境变量：`DATABASE_URL`；`SNAPSHOT_TASK_SLEEP_MS`（默认 10000，e2e 用 `0`）。

## 本地常用命令

```bash
pnpm install
pnpm --filter api db:migrate          # 需 DATABASE_URL
pnpm --filter api dev                 # :8080，会先 build @canyon/data
pnpm --filter app dev                 # Vite，/api 代理到 :8080
pnpm --filter docs dev
pnpm e2e                              # 先 build real-app，再跑 @canyon/e2e（**不清库**）
pnpm --filter api test                # 同 e2e:api
```

e2e：`e2e/api/01-*.e2e.test.ts`（init 边角）、`02-coverage-flow.e2e.test.ts`（顺序全流程）；`e2e/scenarios/real-project/`（Playwright + HTTP）。断言按本次 `buildHash` 隔离，因不清库。

## 约定与禁区

- **client / map 写入**：优先 insert + `onConflict doNothing`，不要随意 upsert 覆盖。
- 快照落库的 coverage 必须是 **回溯后的源码路径**，不要只存仪器侧 build 路径。
- 改 `@canyon/data` 后需 `pnpm --filter @canyon/data build`（api 的 dev/test/build 脚本已带）。
- 文档站 Pages：`base` 在 `GITHUB_PAGES=true` 时为 `/canyon/`；workflow：`.github/workflows/deploy-docs.yml`（`next` 分支）。`github-pages` 环境需允许部署分支。
- 不要提交密钥；不要擅自 force push / 改 git config。
- 用户未明确要求时不要主动 commit / push / 开 PR。

## 给 Agent 的阅读顺序

1. 本文 + `apps/docs/docs/guide/start/concepts.mdx`
2. `services/api/src/routes/collect.ts` + `services/coverage-*.ts`
3. `packages/data/src/{assemble,remap}.ts`
4. CI 集成：`apps/docs/docs/guide/ci/overview.mdx`
