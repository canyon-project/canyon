# api

Canyon next5 后端（Hono + Prisma + PostgreSQL）。

## 启动

```bash
# 仓库根目录
pnpm install
cd api
cp .env.example .env   # 配置 DATABASE_URL
pnpm run generate
# 按需执行 schema.sql 建表
pnpm run dev
```

默认：`http://localhost:8080`。

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | `tsx watch` 开发 |
| `pnpm run build` / `start` | 编译与生产启动 |
| `pnpm run generate` | `prisma generate` |
| `pnpm run migrate:sql` | 从 Prisma schema 生成 `schema.sql` |

## 路由

| 方法 | 路径 | 文件 |
| --- | --- | --- |
| POST | `/api/coverage/map/init` | `src/routes/collect.ts` |
| POST | `/api/coverage/client` | `src/routes/collect.ts` |
| POST | `/api/coverage/snapshot` | `src/routes/coverage.ts` |
| GET | `/api/coverage/snapshot/:id` | `src/routes/coverage.ts` |
| GET | `/api/coverage/snapshot/:id/report-data` | `src/routes/coverage.ts` |

快照完成后 HTML 报告目录：`public/snapshots/{id}/`  
访问：`http://localhost:8080/snapshots/{id}/index.html`

需配置 `.env` 中的 `GITLAB_BASE_URL`、`GITLAB_PRIVATE_TOKEN`（见 `.env.example`）。

详细说明：[覆盖率 API 文档](../docs/docs/zh/api/coverage.md)  
Agent 约定：[docs/agent.md](../docs/agent.md)
