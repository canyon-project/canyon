# @canyon/e2e

仓库级端到端测试，分两层：

| 目录 | 命令 | 说明 |
| --- | --- | --- |
| `api/` | `pnpm --filter @canyon/e2e test:api` | Vitest：map/client/snapshot 契约（进程内 API） |
| `scenarios/real-project/` | `pnpm --filter @canyon/e2e test:real-project` | Playwright：`@canyon/real-app` + HTTP 全链路 |

## 前置

```bash
pnpm --filter @canyon/real-app build   # 生成 .canyon_output
export TEST_DATABASE_URL=postgres://postgres:123456@localhost:5432/canyon_test
pnpm --filter api db:migrate
```

## 一次跑全量

```bash
pnpm e2e
```

（见仓库根 `package.json`）

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `TEST_DATABASE_URL` / `DATABASE_URL` | Postgres（API / Playwright 用例） |
| `CANYON_REAL_APP_DIR` | 覆盖 real-app 路径 |
| `CANYON_OUTPUT_DIR` | 覆盖 `.canyon_output` 路径 |
| `SNAPSHOT_TASK_SLEEP_MS` | 快照额外等待；测试内默认 `0` |
