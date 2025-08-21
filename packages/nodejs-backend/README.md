## NodeJS Backend（NestJS）重构说明

本目录为基于 NestJS 的后端重构实现，替代 `packages/backend` Go 服务。核心技术栈：
- NestJS（HTTP 路由与模块化）
- MikroORM（Postgres，可按需启用）
- @clickhouse/client（ClickHouse 查询）
- prom-client（/metrics 指标）

### 目标
- 在 `packages/nodejs-backend` 中重建可运行的后端骨架，并逐步迁移原 Go 端 API。
- 复用原有数据结构与配置来源（如 GitLab 配置存于数据库表 `canyonjs_config`）。
- 保持原有路由形态（/api 前缀、/vi/health 兼容）与行为一致或向后兼容。

## 架构与模块
- modules/ch
  - `ChModule`、`ChService`：封装 `@clickhouse/client`，在启动时创建与关闭客户端；使用 `url` 字段（替代已废弃的 host）。
- modules/pg
  - `PgModule`：承载 MikroORM 的实体 `forFeature`；仅在 `POSTGRES_URL` 存在时启用（按需加载）。
- modules/system-config
  - `SystemConfigModule`（Global）：`SystemConfigService` 通过 MikroORM 的原生连接读取 `canyonjs_config` 表中的键值。
  - 关键键名（与 Go 一致）：
    - `system_config.gitlab_base_url`
    - `git_provider[0].private_token`
- modules/coverage
  - `CoverageController`：统一入口 `/api/coverage/*`。
  - `CoverageService`：
    - commit 模式：从 PG 取 coverage 列表 → 在 CH 聚合 hits（sumMapMerge）→ 以 `instrument_cwd` 规范化路径，返回明细。
    - PR 模式（pulls）：
      - GitLab: 读取 MR、commits、compare diffs（依赖 DB 中 GitLab 配置）
      - fileMerge：非变更文件直接并入命中，变更文件跳过。
      - blockMerge：拉取 baseline 与其它 commit 的 coverage_map 结构和源码，对齐函数/语句片段（哈希+最近位置），将其它 commit 的命中映射到 baseline 的 id 上并聚合。
- modules/repo
  - `RepoController`、`RepoService`：迁移 `/api/repo` 路由，当前为占位实现，后续接入 VCS/DB。
- modules/code
  - `CodeController`、`CodeService`：迁移 `/api/code` 路由；GitLab 请求优先用 DB 配置，DB 无值回退环境变量。

## 路由对照与现状
- 兼容路由（不带 /api 前缀）：
  - `GET /vi/health`（快速健康检查）
  - `GET /metrics`（prom-client 指标）
- 全局前缀：`/api`（通过 `exclude` 排除了上面两个根路由）
- 迁移完成的 API：
  - `GET /api/coverage/overview`
  - `GET /api/coverage/summary/map`
  - `GET /api/coverage/map`（支持 `subject=commit|pulls`，PR 模式支持 `mode=fileMerge|blockMerge`）
  - `GET /api/repo`、`POST /api/repo/id`、`GET /api/repo/:repoID/commits`、`GET /api/repo/:repoID/pulls`、`GET /api/repo/:repoID/commits/:sha`
  - `GET /api/code`、`GET /api/code/pulls/:projectID/:pullRequestID`、`GET /api/code/pulls/:projectID/:pullRequestID/changes`、`GET /api/code/projects/*`

## 配置与环境变量
- 数据库（可选）
  - Postgres：`POSTGRES_URL=postgresql://user:pass@host:5432/db`
  - ClickHouse：`CLICKHOUSE_URL=http://localhost:8123`、`CLICKHOUSE_DATABASE=default`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD`
- 服务端口：`PORT=3000`
- GitLab（若 DB 无配置时的兜底）：
  - `GITLAB_BASE_URL=https://gitlab.example.com`
  - `GITLAB_TOKEN=<private-token>`
- DB 配置来源（优先）：表 `canyonjs_config`
  - `system_config.gitlab_base_url`
  - `git_provider[0].private_token`

说明：当未设置 `POSTGRES_URL` 时，MikroORM 不会初始化，系统配置服务将返回 `undefined`；此时仅依赖环境变量兜底。

## 指标、中间件与全局设置
- `/metrics`：prom-client，自定义指标：
  - `http_requests_total{method,path,status}`
  - `http_request_duration_seconds{method,path,status}`
- `CORS`：允许任意源，暴露常见头，支持 OPTIONS。
- 全局校验管道：`ValidationPipe`（whitelist/transform）。
- 全局前缀：`/api`，但 `vi/health` 与 `metrics` 被排除。

## ClickHouse 查询要点
- coverage map：
  - 表：`coverage_map`
  - 典型查询：选取 `statement_map`、`fn_map`、`branch_map` 与 `hash`；在 Node 端用 JSONEachRow 取回并解析。
- coverage hits：
  - 表：`coverage_hit_agg`
  - 典型聚合：`sumMapMerge(s|f|b)` 按 `full_file_path`（或携带 `coverage_id`）聚合。

## 运行与开发
```bash
# 安装依赖（在仓库根目录）
pnpm i

# 开发启动（仅后端）
cd packages/nodejs-backend
pnpm dev

# 或构建 + 启动
pnpm build && pnpm start

# 健康检查
curl http://localhost:3000/vi/health
curl http://localhost:3000/api/health

# 覆盖率示例
curl "http://localhost:3000/api/coverage/overview?subject=commit&subjectID=<sha>&provider=github&repoID=<repo>"
```

## Nx 集成
- `packages/nodejs-backend/project.json`：提供 `dev`、`build`、`test` 目标，配合根脚本 `pnpm build` 等统一编排。
- `nest-cli.json`、`tsconfig*.json` 已配置。

## 已知差异与后续计划
- Repo 模块当前为占位数据，后续接入 DB/VCS。
- Coverage PR 模式的 blockMerge 已实现片段对齐与映射，但可进一步优化性能（批量拉取源码、缓存 coverage_map 等）。
- 按需迁移剩余 Go 侧逻辑（异常处理、更多 DTO 校验、鉴权等）。

## 目录索引（关键文件）
- `src/main.ts`：应用入口、全局中间件、前缀与校验。
- `src/app.module.ts`：模块装配（PG 按需加载、CH、SystemConfig、业务模块）。
- `src/modules/coverage/*`：覆盖率控制器与服务（含 ClickHouse/PG/GitLab 组合逻辑）。
- `src/modules/code/*`：代码相关接口，DB/ENV 读取 GitLab 配置。
- `src/modules/repo/*`：仓库相关接口（占位）。
- `src/modules/ch/*`：ClickHouse 客户端封装。
- `src/modules/system-config/*`：DB 配置读取服务。
- `src/middleware/metrics.middleware.ts`、`src/metrics.ts`：Prometheus 指标。


