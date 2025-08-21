## NodeJS Backend（NestJS + GraphQL）重构说明

本目录是基于 NestJS 的后端重构，实现对 `packages/backend`（Go）的迁移替换。当前形态：部分接口维持 REST，其余改为 GraphQL。

### 技术栈
- NestJS（模块化 & 中间件）
- GraphQL（`@nestjs/graphql` + `@nestjs/apollo`，Apollo Driver）
- MikroORM（Postgres，按需启用）
- ClickHouse（`@clickhouse/client`）
- Axios（外部 HTTP 调用）
- prom-client（/metrics 指标）

### 目标
- 复用原有数据结构与配置来源（GitLab 配置表 `canyonjs_config`）。
- 保持对外协议向后兼容（/api 前缀、部分 REST 保留）。
- 将可迁移的接口切换为 GraphQL，减少 REST 面的维护成本。

## 模块结构
- modules/ch：`ChModule`、`ChService` 封装 ClickHouse 客户端。
- modules/orm：`OrmModule` 注册 MikroORM 并暴露实体仓库（`ConfigEntity`、`CoverageEntity`、`CoverageMapRelationEntity`）。
- modules/system-config：`SystemConfigModule`（全局），`SystemConfigService` 从表 `canyonjs_config` 读取配置键：
  - `system_config.gitlab_base_url`
  - `git_provider[0].private_token`
- modules/coverage（REST 保留）：
  - `CoverageController`（REST）：`/api/coverage/*`
  - `CoverageService`：
    - commit 模式：PG 查 `canyonjs_coverage` & `canyonjs_coverage_map_relation` → CH 查 `coverage_map`（结构）+ `coverage_hit_agg`（s/f/b）→ 合并并去除 `instrument_cwd` 前缀。
    - pull 模式：支持 `mode=blockMerge`，以 head 为基线，按块映射其它 commit 的命中到基线结构上聚合。
- modules/repo（GraphQL）：`RepoResolver`、`RepoService`，提供仓库相关查询与变更。
- modules/code（GraphQL）：`CodeResolver`、`CodeService`，提供代码文件/PR/变更/项目查询，优先读 DB 配置，回退环境变量。

## API 边界（REST vs GraphQL）
- 兼容 REST（不带 /api 前缀）：
  - `GET /vi/health`（健康检查）
  - `GET /metrics`（Prometheus 指标）
- REST（保留迁移）：
  - `GET /api/coverage/overview`
  - `GET /api/coverage/summary/map`
  - `GET /api/coverage/map`（subject=commit|pull；pull 支持 mode=fileMerge|blockMerge）
- GraphQL：
  - 入口：`/graphql`
  - Repo：
    - Query `repos(keyword?: String): RepoList`
    - Query `repoCommits(repoID: String!): RepoCommits`
    - Query `repoPulls(repoID: String!): RepoPulls`
    - Query `repoCommitBySHA(repoID: String!, sha: String!): RepoCommitDetail`
    - Mutation `postRepoById(id: String!): RepoMutationResult`
  - Code：
    - Query `codeFileContent(repoID: String!, filepath: String!, sha: String, pullNumber: String, provider: String)`
    - Query `codePullRequest(projectID: String!, pullRequestID: String!): String`（JSON 字符串）
    - Query `codePullRequestChanges(projectID: String!, pullRequestID: String!): String`（JSON 字符串）
    - Query `codeProjectByPath(path: String!): String`（JSON 字符串）

## 覆盖率数据结构（与 Go 保持一致）
`GET /api/coverage/map` 返回以相对路径为键的对象；每个文件包含 Istanbul 结构映射与命中计数：
```json
{
  "src/a.ts": {
    "path": "src/a.ts",
    "statementMap": { "0": { "start_line": 1, "start_column": 0, "end_line": 1, "end_column": 10 } },
    "fnMap": { "0": { "name": "fn", "line": 1, "start_pos": [1,0,1,5], "end_pos": [1,6,1,10] } },
    "branchMap": { "0": { "type": 0, "line": 2, "position": [2,0,2,10], "paths": [[2,0,2,5],[2,6,2,10]] } },
    "s": { "0": 3 },
    "f": { "0": 1 },
    "b": { "0": 2 }
  }
}
```

说明：
- commit 模式：按 `full_file_path` 聚合 `s/f/b`，并联表 `coverage_map` 结构；`instrument_cwd` 前缀会被移除。
- pull blockMerge：以 head 结构为骨架，对变更文件按块映射其它 commit 的命中；未变更文件直接累加。

## 配置与环境变量
- Postgres（MikroORM）：`DATABASE_URL=postgresql://user:pass@host:5432/db`
- ClickHouse：`CLICKHOUSE_URL`、`CLICKHOUSE_DATABASE`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD`
- 服务端口：`PORT=3000`
- GitLab 兜底：`GITLAB_BASE_URL`、`GITLAB_TOKEN`
- DB 配置表（优先）：`canyonjs_config` 中的 `system_config.gitlab_base_url` 与 `git_provider[0].private_token`

备注：若缺少 `DATABASE_URL`，MikroORM 将不初始化，系统配置服务回退到环境变量。

## 运行与开发
```bash
# 安装依赖（仓库根目录）
pnpm i

# 开发启动（仅后端）
cd packages/nodejs-backend
pnpm dev

# 或构建 + 启动
pnpm build && pnpm start

# 健康检查
curl http://localhost:3000/vi/health

# GraphQL（默认 /graphql）可用浏览器或客户端访问

# 覆盖率示例（REST）
curl "http://localhost:3000/api/coverage/map?subject=commit&subjectID=<sha>&provider=gitlab&repoID=<id>&filePath=src/a.ts"
```

## 其他
- Axios 统一用于外部 HTTP 请求（替代 fetch）。
- ClickHouse 查询：客户端已指定 `format: 'JSONEachRow'`，SQL 中不再追加 `FORMAT JSONEachRow`。
- `full_file_path` 过滤使用 `endsWith(full_file_path, '<relpath>')` 与返回的相对路径对齐。

## 目录索引
- `src/main.ts`：应用入口、全局中间件与前缀
- `src/app.module.ts`：模块装配（GraphQL、ORM、CH、系统配置、业务模块）
- `src/modules/coverage/*`：覆盖率（REST）
- `src/modules/code/*`：代码（GraphQL）
- `src/modules/repo/*`：仓库（GraphQL）
- `src/modules/ch/*`：ClickHouse 客户端
- `src/modules/system-config/*`：系统配置读取
- `src/modules/orm/*`：MikroORM 装配


