## coverage/client 接口说明

### 概述
- **接口**: POST `/coverage/client`
- **作用**: 接收客户端覆盖率数据，区分 map 与 hit 两类进行处理；将元信息写入 Postgres，将明细与结构写入 ClickHouse；当包含 `inputSourceMap` 时，异步回溯与重映射覆盖率后再入库。
- **幂等键**: `coverageID` = base64url(七元组：`provider/repoID/sha/buildProvider/buildID/reportProvider/reportID`)

### 路由与入口
- 控制器: `src/apps/coverage/coverage.controller.ts`
- 服务: `src/apps/coverage/services/coverage-client.service.ts`
- 入口调用: `CoverageClientService.invoke('1', { ...dto, coverage: formatCoverageData(dto.coverage) })`
- 说明: `formatCoverageData` 目前为直返，预留数据预处理扩展点。

### 请求参数与校验
- DTO: `src/apps/coverage/dto/coverage-client.dto.ts`
  - 必填: `sha(40位hex)`, `provider`, `repoID`, `instrumentCwd`, `coverage`
  - 选填: `reportID`, `branch`, `compareTarget`, `buildID`, `buildProvider`, `reportProvider`, `tags`
- 结构校验: `src/apps/coverage/valids/is-valid-coverage.ts`
  - 每个文件项需包含 `s/f/b`（命中计数）；是否存在 `statementMap/fnMap/branchMap` 用于区分 `map` 或 `hit`。

### 处理流程（Mermaid）
```mermaid
flowchart TD
  A[Controller /coverage/client] --> B[formatCoverageData]
  B --> C[DTO校验(IsValidCoverage)]
  C --> D[Service.invoke]
  D --> E[encodeID -> coverageID]
  E --> F[checkCoverageType(hit/map)]
  F -->|hit 且 PG中无同build记录| G[返回 { type:'hit', coverageCount:0 }]
  F -->|其他| H[inertCoverage PG canyonjs_coverage]

  H --> I{coverageType}
  I -->|hit| J[processCoverageTypeHit]
  I -->|map| K[processCoverageTypeMap]

  %% hit 分支
  J --> J1{是否存在 inputSourceMap}
  J1 -->|是| Q[推入producerQueue 异步处理 -> 立即返回]
  J1 -->|否| R[ClickHouse insert coverage_hit(JSONEachRow)]
  Q --> S[consumer flush 定时触发]
  S --> T[decodeID -> 同build coverage 列表]
  T --> U[genCoverageHitMap: PG groupBy relation + PG source_map + CH map SELECT]
  U --> V[还原文件结构 transformCkToCoverage* + decodeCompressedObject]
  V --> W[merge hit+map -> remapCoverage]
  W --> X[ClickHouse insert coverage_hit(JSONEachRow)]

  %% map 分支
  K --> K1[tryRecoverage(remapCoverageByOld 如有inputSourceMap)]
  K1 --> K2[genMapList 生成 coverageMapHashID/sourceMapHashID]
  K2 --> K3[ClickHouse insert coverage_map(JSONEachRow)]
  K3 --> K4[PG insert coverage_map_relation & coverage_source_map]
  K4 --> K5[ClickHouse insert coverage_hit(JSONEachRow)]

  %% 输出
  R --> Z[返回 文档hash/coverageID/类型/入库结果]
  X --> Z
  K5 --> Z
```

### 数据存储设计

- Postgres（Prisma，`prisma/schema.prisma`）
  - 表 `canyonjs_coverage`（模型 `Coverage`，主键使用 `coverageID` 写入）：存放一次上报的元信息。
  - 表 `canyonjs_coverage_map_relation`（模型 `CoverageMapRelation`）：映射 `coverageID` 与 `coverageMapHashID`/`sourceMapHashID` 以及路径关系，用于回溯。
  - 表 `canyonjs_coverage_source_map`（模型 `CoverageSourceMap`）：保存压缩后的 `sourceMap` 二进制，键为 `sourceMapHashID`。

- ClickHouse（`prisma/local-ck.sql`）
  - 表 `coverage_hit`：hit 明细，短 TTL，避免数据膨胀。
  - 表 `coverage_map`：map 结构，较长 TTL；以 `hash` 稳定去重。
  - 表 `coverage_hit_agg` + 物化视图 `coverage_hit_mv`：聚合加速查询。

### 关键 SQL 语句

1) 查询覆盖图（ClickHouse）
```sql
-- src/apps/coverage/sql/coverage-map-query.sql.ts 等价SQL
SELECT
  statement_map AS statementMap,
  fn_map AS fnMap,
  branch_map AS branchMap,
  restore_statement_map AS restoreStatementMap,
  restore_fn_map AS restoreFnMap,
  restore_branch_map AS restoreBranchMap,
  hash AS coverageMapHashID
FROM coverage_map
WHERE hash IN ('<hash1>', '<hash2>', ...);
```

2) ClickHouse 表结构（节选）
```sql
-- coverage_hit 明细表
CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  coverage_id     String,
  full_file_path  String,
  s               Map(UInt32, UInt32),
  f               Map(UInt32, UInt32),
  b               Map(UInt32, UInt32),
  ts              DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (ts)
TTL ts + toIntervalHour(12);

-- coverage_map 结构表
CREATE TABLE IF NOT EXISTS default.coverage_map
(
  hash     String,
  statement_map Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  fn_map        Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map    Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  restore_statement_map Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  restore_fn_map        Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  restore_branch_map    Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  ts              DateTime
) ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (hash)
TTL ts + toIntervalHour(720)
SETTINGS index_granularity = 8192;
```

3) ClickHouse 插入（JSONEachRow 示例）
```sql
-- coverage_hit 插入示例
INSERT INTO coverage_hit FORMAT JSONEachRow
{"ts": 1719730000, "coverage_id": "<coverageID>", "full_file_path": "<path>", "s": {"1":2}, "f": {"1":1}, "b": {"0":1, "100000":0}}

-- coverage_map 插入示例
INSERT INTO coverage_map FORMAT JSONEachRow
{"ts": 1719730000, "hash":"<coverageMapHashID>", "statement_map": {...}, "fn_map": {...}, "branch_map": {...}, "restore_statement_map": {...}, "restore_fn_map": {...}, "restore_branch_map": {...}}
```

4) Postgres 写入（通过 Prisma）
- `Coverage`：`create({ data: { id: coverageID, ... } })`，主键冲突返回约束信息而不中断流程。
- `CoverageMapRelation`：`createMany({ data, skipDuplicates: true })`。
- `CoverageSourceMap`：`createMany({ data, skipDuplicates: true })`，sourceMap 以压缩二进制写入。

### 关键算法与转换
- 覆盖率类型判定：`checkCoverageType` 以是否存在 `statementMap` 判断 `map` 或 `hit`。
- 分支扁平化：`flattenBranchMap` 将 `b: {id: [c0,c1...]}` 转为 CH `Map<UInt32, UInt32>`（`encodeKey(branchId, index)`），减小存储、便于聚合。
- 回溯与重映射：
  - `remapCoverageByOld`：当存在 `inputSourceMap` 时回溯旧路径/映射；
  - `reorganizeCompleteCoverageObjects` + `mergeCoverageMap`：组合 hit 与 map，填充缺失；
  - `remapCoverage`：最终路径映射与坐标修正后产出可落库的 `FileCoverageData[]`。
- 哈希与幂等：
  - `coverageID`：`encodeID` 基于七元组生成 base64url，跨进程稳定；
  - `coverageMapHashID` 与 `sourceMapHashID`：对结构/对象 `json-stable-stringify` 后取 sha256，保证稳定去重。

### 返回结构（示例）
```json
{
  "hash": "<coverage对象稳定hash>",
  "instrumentCwd": "<instrument根目录>",
  "coverageID": "<Base64URL幂等ID>",
  "coverageType": "hit | map",
  "coverageCreateRes": { "result": "success", "coverageID": "<id>" },
  "handResult": {
    "coverageHitInsertResult": "...",
    "coverageMapInsertResultRes": "...",
    "coverageRelationAndMapRes": "..."
  }
}
```

### 边界与容错
- 渐进式容错：部分字段缺失时使用空串；覆盖率主键冲突返回可解析结果。
- hit 快速返回：当同 build 维度无历史 `coverage` 时直接 `{ type:'hit', coverageCount:0 }`，避免无效回溯。
- 队列异步：包含 `inputSourceMap` 的 hit 走内存队列，定时 `flush` 合并后再回溯与入库，控制热点与计算成本。
- TTL 策略：`coverage_hit` 短 TTL，`coverage_map` 长 TTL；聚合表减压查询。

### 性能与可观测性
- 控制频繁 DB 访问：map/hash 去重、`skipDuplicates`、定时批处理。
- 关键日志：多处输出 `coverageID`、数量级与结果，便于链路追踪与问题回溯。

### 依赖与代码位置速览
- 路由：`src/apps/coverage/coverage.controller.ts`
- 服务：`src/apps/coverage/services/coverage-client.service.ts`
- SQL：`src/apps/coverage/sql/coverage-map-query.sql.ts`
- 校验：`src/apps/coverage/valids/is-valid-coverage.ts`
- 工具：`src/apps/coverage/helpers/{checkCoverageType, ekey, coverageID, transform, generateObjectSignature}.ts`
- Schema：`prisma/schema.prisma`（PG），`prisma/local-ck.sql`（CH）

### 示例调用
```bash
curl -X POST http://<host>/coverage/client \
  -H 'Content-Type: application/json' \
  -d '{
    "sha":"<40hex>",
    "provider":"github",
    "repoID":"<repo>",
    "instrumentCwd":"/workspace",
    "coverage": { "/abs/file.js": { "s":{}, "f":{}, "b":{} } }
  }'
```

### 重要提示
- `Coverage.id` 以 `coverageID` 写入，覆盖默认 cuid，确保幂等。
- `filePath = fullFilePath` 去掉 `instrumentCwd` 前缀；`coverage_map_relation.id = coverageID|filePath`。
- `b` 字段在入 CH 前需扁平化；必要时在读取端使用 `decodeKey` 还原。


