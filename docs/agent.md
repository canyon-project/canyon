# Agent 约定（Canyon next5 / api）

暂时只关注中文文档。

## 范围

- 当前实现重心在 `api/`：Hono + Prisma + PostgreSQL。
- 表名前缀统一：`canyonjs_next5_*`。
- 文档站点在 `docs/`；新增说明优先写中文。

## 覆盖率域架构（必读）

```
CoverageBuild (buildHash)
  ├── CoverageScene (sceneKey / scene)
  │     └── CoverageHit  (追加写，同文件可多行)
  └── CoverageMapRelation
        ├── CoverageMap
        └── CoverageSourceMap?

CoverageSnapshot  (用户触发；数字自增 id)
CoverageClientPayloadIdempotency  (client 全量 body 幂等)
```

### 核心原则

1. **Hit 与 Map 分离**  
   - `/api/coverage/map/init`：写 build + map（不写 hit）。  
   - `/api/coverage/client`：hit **追加写入**，不做读改写合并。

2. **禁止上报热路径 upsert / find→merge→update**  
   高并发下会丢更新或冲突。client 用 `createMany({ skipDuplicates: true })`。  
   聚合留给快照（或后续后台 compact）。

3. **快照再聚合**  
   用户触发 → 任务队列串行 → 压缩 hit → 跨 scene merge → 拼 map/sourcemap 还原 Istanbul → 落 `CoverageSnapshot`。

4. **命名**  
   - 构建级实体叫 `CoverageBuild`，不要再叫 `Coverage`。  
   - 场景用 `CoverageScene`。

## 路由拆分

| 文件 | 职责 |
| --- | --- |
| `api/src/routes/collect.ts` | 仅 2 个：`POST /coverage/map/init`、`POST /coverage/client` |
| `api/src/routes/coverage.ts` | 快照：创建 / 轮询 / report-data |
| `api/src/index.ts` | `app.route('/api', collect)` + `app.route('/api', coverage)` |

## Hit 写入约定

- `CoverageHit.id = payloadHash + "|" + rawFilePath`（主键，不可重复）。  
- 同文件不同上报 → 不同 `payloadHash` → 多行共存。  
- 先 insert 幂等表再写 hit；冲突则视为重复负载。  
- `??` 不要用于可选字符串回退（`""` 不会落入右侧）；用 `||`。

## 快照任务约定

- 状态：`queued` → `generating` → `completed` | `failed` | `timeout`。  
- **排队不计超时**；真正开始 `generating` 后才计 **5 分钟**。  
- 进程内串行队列（简单版）；多副本部署时需另做分布式锁/队列。  
- 创建/轮询响应 **不带** `istanbul`；详情走 `GET /api/coverage/snapshot/:id/report-data`。  
- 快照 id 为 **数字自增**。

## Scene 过滤

- 用户传 `scene` 对象；匹配规则：filter 中每个字段都与 `CoverageScene.scene` 相等。  
- `scene: {}` 或不传 → 匹配该 build 下全部 scene。

## 快照 HTML 报告

- 生成快照时用 `GITLAB_BASE_URL` + `GITLAB_PRIVATE_TOKEN`，按 `CoverageBuild.repoID` + `sha` 拉 archive.zip 并解压（缓存于 `api/.cache`）。  
- 用解压源码作 `sourceFinder`，结合 Istanbul 生成 html 到 `api/public/snapshots/{id}/`。  
- 访问：`http://localhost:8080/snapshots/{id}/index.html`（完成后轮询响应带 `reportUrl`）。

## 本地常用命令

```bash
# 根目录
pnpm install          # 若出现 Ignored build scripts，在 pnpm-workspace.yaml allowBuilds 中放行 prisma/esbuild
cd api
pnpm run generate     # prisma generate
pnpm run migrate:sql  # 从 schema 生成 schema.sql
pnpm run dev          # 默认 http://localhost:8080
```

Prisma：`api/prisma/schema.prisma`；SQL：`api/schema.sql`。

## 详细文档

- 覆盖率 API：`docs/docs/zh/api/coverage.md`  
- 数据模型（通用）：`docs/docs/zh/guide/data/schema.md`  
- API 包说明：`api/README.md`
