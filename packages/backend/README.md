## Canyon Backend (NestJS)

基于 NestJS、GraphQL、MikroORM(PostgreSQL) 与 ClickHouse 的后端服务。

### 功能概览
- 覆盖率数据采集与聚合（ClickHouse）
- 覆盖率 Map/汇总查询（REST: `/api/coverage/*`）
- 代码与仓库信息（GraphQL: `/graphql`）

### 目录结构
- `src/` 核心源码
  - `modules/coverage` 覆盖率 Map 与汇总
  - `modules/repo` 仓库/提交/MR 查询
  - `modules/ch` ClickHouse 客户端封装
  - `entities` MikroORM 实体
- `schema.gql` 运行时生成的 GraphQL Schema

### 运行依赖
- PostgreSQL（通过 `DATABASE_URL` 连接）
- ClickHouse（覆盖率聚合存储）
- 可选：GitLab API（某些 MR 相关能力）

### 环境变量
- `PORT`（默认 8080）
- `DATABASE_URL`（PostgreSQL 连接串）
- `CLICKHOUSE_HOST`（默认 `http://localhost:8123`）
- `CLICKHOUSE_DATABASE`（默认 `default`）
- `CLICKHOUSE_USER`（默认 `default`）
- `CLICKHOUSE_PASSWORD`（默认 `password`）
- `GITLAB_BASE_URL`、`GITLAB_TOKEN`（GitLab 访问所需，可由系统配置覆盖）

可在项目根目录 `.env` 中配置，上线前请妥善管理密钥。

### 安装与启动
1. 安装依赖（在仓库根目录执行）
```bash
pnpm i
```
2. 构建与启动
```bash
pnpm --filter backend build
pnpm --filter backend dev # 开发热重载
# 或
pnpm --filter backend start
```

服务默认监听 `http://127.0.0.1:8080`：
- GraphQL Playground: `http://127.0.0.1:8080/graphql`
- REST: `GET /api/coverage/map`、`GET /api/coverage/summary/map`

### 接口示例
- 获取 Commit 覆盖 Map
```
GET /api/coverage/map?subject=commit&subjectID=<sha>&provider=<gitlab|github>&repoID=<repoId>&filePath=src/index.ts
```
- 获取 Pull/MR 覆盖汇总
```
GET /api/coverage/summary/map?subject=pull&subjectID=<iid>&provider=gitlab&repoID=<projectId>&mode=blockMerge
```

### 开发提示
- MikroORM 配置见 `src/mikro-orm.config.ts`
- ClickHouse 表结构参考 `sql/clickhouse.sql`
- 通过 `packages/backend/src/modules/coverage` 查看覆盖率逻辑


