### 接口文档：获取覆盖率映射（详细）

- **接口路径**: `GET /api/coverage/map`
- **所在代码**: `packages/backend/handlers/coverage.go` → `GetCoverageMapBySubject` → `CoverageService`
- **功能**: 根据 subject（commit/pull）统一入口返回 Istanbul 结构的“覆盖率明细映射”（包含 `statementMap/fnMap/branchMap` 与 `s/f/b` 计数）
- **数据来源**:
  - Postgres: `canyonjs_coverage`, `canyonjs_coverage_map_relation`
  - ClickHouse: `coverage_map`, `coverage_hit_agg`
  - GitLab API（PR 合并模式时用于获取 head SHA、提交列表与差异）

---

## 请求参数

- **通用必填**
  - `provider`: 代码托管平台（如 `gitlab`）
  - `repoID`: 仓库标识（GitLab 为数字项目 ID）
  - `subject`: `commit|commits|pull|pulls`
  - `subjectID`:
    - `commit|commits` 时为 `sha`
    - `pull|pulls` 时为 `pullNumber`
- **可选过滤**
  - `filePath`: 仅返回该文件的覆盖数据
  - `buildProvider`, `buildID`: 构建过滤（非必填；与 `/summary/map` 不同，这里未强制）
  - `reportProvider`, `reportID`: 报告过滤（用于筛选 coverage）
- **PR 专用**
  - `mode`: `blockMerge | fileMerge | (默认空=单 commit 模式)`
    - 空或未知值：直接返回 head commit 的覆盖明细
    - `blockMerge`：以 head 为基线，块级合并其他 commit 的命中（仅变更文件特殊处理）

---

## 响应数据（示例结构）

返回一个以文件绝对路径为键的对象；每个文件包含 Istanbul 结构的映射与计数：

```json
{
  "/abs/path/to/file.ts": {
    "path": "/abs/path/to/file.ts",
    "statementMap": { "keys": [], "values": {} },
    "fnMap": { "keys": [], "values": {} },
    "branchMap": { "keys": [], "values": {} },
    "s": { "0": 10, "1": 0, "2": 1 },
    "f": { "0": 2, "1": 0 },
    "b": { "0": [1, 0], "1": [0, 0, 1] }
  }
}
```

文件路径会在返回前移除 `instrumentCwd` 前缀，转换为相对仓库内路径。

---

## 处理流程（Mermaid）

```mermaid
graph TD
  A[HTTP GET /api/coverage/map] --> B{subject}
  B -->|commit/commits| C[GetCoverageMap]
  B -->|pull/pulls| D[GetCoverageMapForPull]

  %% commit/commits 分支
  C --> C1[PG 查询 canyonjs_coverage<br/>按 provider/repoID/sha 及可选构建/报告过滤]
  C1 -->|coverageIDs| C2[PG 查询 canyonjs_coverage_map_relation<br/>按 coverage_id IN ...<br/>可选 filePath 过滤 + group by 去重]
  C2 --> C3[并行查询 ClickHouse]
  C3 --> C31[SELECT ... FROM coverage_map WHERE hash IN ...]
  C3 --> C32[SELECT ... FROM coverage_hit_agg WHERE coverage_id IN ... GROUP BY full_file_path]
  C31 --> C4[合并 coverage_map + hit 为 Istanbul 结构]
  C32 --> C4
  C4 --> C5[移除 instrumentCwd 前缀]
  C5 --> E[返回 JSON]

  %% pull/pulls 分支
  D --> D0{mode}
  D0 -->|默认/其他| DC[解析 head SHA via GitLab] --> DD[委托 GetCoverageMap(单 commit)]
  D0 -->|blockMerge/fileMerge| D1[解析 head SHA + PR commits]
  D1 --> D2[PG 查询所有 commits 的 canyonjs_coverage]
  D2 --> D3[PG 查询 coverage_map_relation：<br/>去重关系 + 完整关系(含 coverage_id)]
  D3 --> D4[CH 查询 coverage_map + coverage_hit_agg(含 coverage_id 维度)]
  D4 --> D5[构建 baseline(head) + 计算各 commit 的变更文件集]
  D5 --> D6[聚合命中：<br/>baseline 合并全部；<br/>非 baseline 的未变更文件直接并入；<br/>变更文件在 blockMerge 下按块级合并]
  D6 --> D7[以 baseline 的 coverage_map 结构生成最终返回]
  D7 --> E
```

---

## 关键 SQL 与查询逻辑

### 1) Postgres：查询 coverage 列表
等价 SQL（GORM 动态构建）：

```sql
SELECT *
FROM "public"."canyonjs_coverage"
WHERE provider = :provider
  AND repo_id = :repoID
  AND sha = :sha             -- commit 模式
  -- OR sha IN (:shaList)    -- pull 合并模式
  -- AND build_provider = :buildProvider  -- 可选
  -- AND build_id = :buildID            -- 可选
;
```

表结构参考（节选，见 `packages/backend/sql/postgres.sql`）：

```sql
CREATE TABLE "public"."canyonjs_coverage" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT,
  "repo_id" TEXT,
  "sha" TEXT,
  "build_provider" TEXT,
  "build_id" TEXT,
  "report_provider" TEXT,
  "report_id" TEXT,
  "instrument_cwd" TEXT
);
```

### 2) Postgres：查询 coverage_map 关联关系

- 为获取 ClickHouse 的 `hash` 与 `full_file_path`，对关联关系做去重。
- commit 模式：

```sql
SELECT coverage_map_hash_id, full_file_path
FROM "public"."canyonjs_coverage_map_relation"
WHERE coverage_id IN (:coverageIDs)
  -- AND file_path = :filePath       -- 可选
GROUP BY coverage_map_hash_id, full_file_path;
```

- pull 合并模式还会查询完整关系列表（保留 coverage_id）：

```sql
SELECT coverage_id, coverage_map_hash_id, full_file_path
FROM "public"."canyonjs_coverage_map_relation"
WHERE coverage_id IN (:coverageIDs)
  -- AND file_path = :filePath       -- 可选
;
```

表结构参考（节选）：

```sql
CREATE TABLE "public"."canyonjs_coverage_map_relation" (
  "id" TEXT PRIMARY KEY,
  "coverage_id" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "full_file_path" TEXT NOT NULL,
  "coverage_map_hash_id" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cov_map_relation_coverage_id
  ON "public"."canyonjs_coverage_map_relation" ("coverage_id");
```

### 3) ClickHouse：查询 coverage_map（结构映射）

来源：`packages/backend/services/coverage_builder.go`

```sql
SELECT
  statement_map as statementMap,
  toString(fn_map) as fnMap,
  toString(branch_map) as branchMap,
  hash as coverageMapHashID
FROM coverage_map
WHERE hash IN (:hashList);
```

- 摘要模式（用于 summary，仅供参考）：

```sql
SELECT
  hash as coverageMapHashID,
  mapKeys(statement_map) as statementKeys
FROM coverage_map
WHERE hash IN (:hashList);
```

### 4) ClickHouse：查询 coverage_hit_agg（命中计数）

- commit 模式（聚合到文件级别）：

```sql
SELECT
  full_file_path as fullFilePath,
  sumMapMerge(s) AS s,
  sumMapMerge(f) AS f,
  sumMapMerge(b) AS b
FROM default.coverage_hit_agg
WHERE coverage_id IN (:coverageIDs)
GROUP BY full_file_path;
```

- pull 合并模式（保留 coverage_id 维度，选择列由 `fields` 控制，如 "sf"）：

```sql
SELECT
  coverage_id as coverageID,
  full_file_path as fullFilePath,
  sumMapMerge(s) AS s,  -- 可选
  sumMapMerge(f) AS f,  -- 可选
  sumMapMerge(b) AS b   -- 可选
FROM default.coverage_hit_agg
WHERE coverage_id IN (:coverageIDs)
GROUP BY coverage_id, full_file_path;
```

---

## 合并与返回规则（核心设计）

- **结构侧（coverage_map）**：从 ClickHouse 获取每个 `hash` 的 `statementMap/fnMap/branchMap`，转换为 Istanbul 结构的 ordered map。
- **命中侧（coverage_hit_agg）**：
  - commit 模式：将 `s/f/b` 聚合到 `full_file_path`，与结构按路径归并。
  - pull 合并模式：
    - 确定 `headSHA` 作为 baseline；若无命中则降级取任意一个覆盖为 baseline。
    - GitLab 获取 PR commits 与差异，构建每个非基线 commit 的“变更文件集合”。
    - 聚合策略：
      - baseline 覆盖：其所有命中都被纳入；
      - 非 baseline：
        - 未变更文件：计数直接纳入（相当于并集叠加）；
        - 变更文件：当 `mode=blockMerge` 时，进行“块级合并”，通过比对基线与其他版本的文件内容及 `coverage_map` 的块映射，按块累计命中；`fileMerge` 预留（按文件粒度的合并策略）。
    - 最终结果统一以 baseline 的 `coverage_map` 结构为骨架，再填充合并后的 `s/f/b`。
- **路径规范化**：返回前移除 `instrumentCwd` 前缀，使路径相对仓库根目录。
- **空结果**：若找不到 coverage 或者找不到 relations，返回 `{}`。

---

## 错误与边界

- 参数缺失：`provider/repoID/subject/subjectID` 为空返回 400。
- 数据查询异常：PG/CH/GitLab 任一失败返回 500。
- PR 模式：
  - 若无法解析 head SHA 或无法获取 PR commits，返回 500。
  - 若对应 commits 没有 coverage，返回 `{}`。
  - 当 block 合并过程需要代码内容时，若获取不到文件内容或映射不全，会跳过该片段的合并贡献（尽量“有则并入，无则跳过”）。

---

## 使用示例

- 获取指定 commit 的覆盖率映射：

```
GET /api/coverage/map?provider=gitlab&repoID=123&subject=commit&subjectID=<sha>&buildProvider=<bp>&buildID=<bid>&reportProvider=<rp>&reportID=<rid>&filePath=src/a.ts
```

- 获取 PR 的覆盖率映射（单 commit=head）：

```
GET /api/coverage/map?provider=gitlab&repoID=123&subject=pull&subjectID=456
```

- 获取 PR 的覆盖率映射（块级合并）：

```
GET /api/coverage/map?provider=gitlab&repoID=123&subject=pull&subjectID=456&mode=blockMerge
```

---

## 相关代码定位（便于维护）

```133:157:packages/backend/handlers/coverage.go
switch subject {
case "commit", "commits":
  q := dto.CoverageQueryDto{Provider: provider, RepoID: repoID, SHA: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID}
  result, err := h.coverageService.GetCoverageMap(q)
  ...
case "pull", "pulls":
  q := dto.CoveragePullMapQueryDto{Provider: provider, RepoID: repoID, PullNumber: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID, Mode: mode}
  result, err := h.coverageService.GetCoverageMapForPull(q)
  ...
}
```

```16:80:packages/backend/services/coverage_query.go
func (s *CoverageService) getCoverageMapInternal(query dto.CoverageQueryDto) (interface{}, error) {
  // 1) PG: canyonjs_coverage
  // 2) PG: canyonjs_coverage_map_relation (可选 filePath 过滤 + 去重)
  // 3) CH: coverage_map + coverage_hit_agg 并行查询
  // 4) 合并结果为 Istanbul 结构
  // 5) 移除 instrumentCwd 前缀
}
```

```80:395:packages/backend/services/coverage_pull.go
func (s *CoverageService) GetCoverageMapForPull(query dto.CoveragePullMapQueryDto) (interface{}, error) {
  // mode=默认 → head commit 走 getCoverageMapInternal
  // mode=blockMerge/fileMerge → 多 commit 聚合：
  // PG 查询 coverage 与 relations(+all)
  // CH 查询 coverage_map & coverage_hit_agg(带 coverage_id)
  // GitLab 获取 commits 与 diff
  // 以 head 结构为 baseline，聚合/块级合并命中后返回
}
```

```10:25:packages/backend/services/coverage_builder.go
func (s *CoverageService) buildCoverageMapQuery(hashList []string) string {
  return `
    SELECT statement_map as statementMap,
           toString(fn_map) as fnMap,
           toString(branch_map) as branchMap,
           hash as coverageMapHashID
    FROM coverage_map
    WHERE hash IN (...)
  `
}
```

