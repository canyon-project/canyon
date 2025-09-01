### 覆盖率明细接口说明：GET /api/coverage/map

- **用途**: 返回单次提交或 PR 的“按文件”的 Istanbul 覆盖率明细（statementMap/fnMap/branchMap 与命中 s/f/b）。
- **路由**: `coverage.GET("/map", coverageHandler.GetCoverageMapBySubject)`
- **返回**: 200 时为对象，对象键是源文件相对路径，值是 Istanbul FileCoverage 对象；未命中或无数据时返回 `{}`

### 查询参数
- **subject [必填]**: `commit` | `pull`（`commits` 等价于 `commit`）
- **subjectID [必填]**:
  - 当 subject=commit: 提交 `sha`
  - 当 subject=pull: PR 编号（当前仅支持 GitLab）
- **provider [必填]**: 代码托管平台（如 `gitlab`）
- **repoID [必填]**: 仓库 ID（GitLab 为数字 ID，如 `86927`）
- **mode [可选]**: 合并模式（仅在 subject=pull 生效）
  - `blockMerge`: 块级（函数/语句）匹配合并，仅对“改动文件”做块级吸收
  - `fileMerge`: 文件级合并，仅合并“未改动文件”，改动文件不做块级合并
  - 其他/空: 直接返回 PR head commit 的明细（不做任何合并）
- **filePath [可选]**: 仅返回指定文件的覆盖率（相对 instrumentCwd 的路径）。commit 与 pull 都生效
- 过滤构建/报告用（可选）
  - `buildProvider`, `buildID`
  - `reportProvider`, `reportID`

### 行为说明
- **subject=commit**
  - 直接查询该 `sha` 的覆盖率明细
  - `filePath` 会在数据库层精确过滤，返回该文件的明细或空对象
- **subject=pull**
  - 解析 PR 的 head `sha`（目前只支持 `gitlab`）
  - `filePath` 会在关系查询和 ClickHouse 汇总时过滤，确保只返回该文件
  - 合并模式：
    - `blockMerge`: 以 head 为基线；对未改动文件累加命中；对改动文件进行块级匹配后吸收命中
    - `fileMerge`: 以 head 为基线；仅未改动文件累加命中；改动文件不进行块级合并（保持基线）
    - 默认: 不合并，直接返回 head commit 的结果
- **返回结构（示例，单文件键值）**:
  - 键：`"src/foo.ts"`
  - 值字段：`path`, `statementMap`, `fnMap`, `branchMap`, 命中计数 `s`/`f`/`b`
  - 路径均为去除 `instrumentCwd` 的相对路径

### 响应码
- 200: 成功
- 400: 缺少必要参数或 `subject` 非法
- 500: 内部错误（如后端/ClickHouse 查询异常）

### 示例
- 提交明细（单文件）:
```bash
curl "http://localhost:3000/api/coverage/map?subject=commit&subjectID=<sha>&provider=gitlab&repoID=86927&filePath=src/components/B0.tsx"
```
- PR 明细（块级合并）:
```bash
curl "http://localhost:3000/api/coverage/map?subject=pull&subjectID=10&provider=gitlab&repoID=86927&mode=blockMerge"
```
- PR 明细（文件级合并，仅未改动文件累加）:
```bash
curl "http://localhost:3000/api/coverage/map?subject=pull&subjectID=10&provider=gitlab&repoID=86927&mode=fileMerge"
```
- PR 明细（单文件 + 块级合并）:
```bash
curl "http://localhost:3000/api/coverage/map?subject=pull&subjectID=10&provider=gitlab&repoID=86927&filePath=src/components/B0.tsx&mode=blockMerge"
```

### 约束与注意
- PR 聚合当前仅支持 `gitlab`；`repoID` 必须是数字 ID
- `mode` 替代旧的 `blockMerge` 参数（旧参数不再兼容）
- 无匹配覆盖数据时返回 `{}`，不是 `null`
- 返回对象的键为“相对路径”，已去除 `instrumentCwd`
