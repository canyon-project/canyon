# Canyon Coverage System

基于老代码重新生成的覆盖率系统，包含前端和后端。

## 项目结构

```
packages/
├── frontend/          # React + TypeScript 前端
│   ├── src/
│   │   ├── pages/     # 普通页面 (projects, login等)
│   │   ├── cov-pages/ # 覆盖率相关页面 (:provider/:org/:repo路由)
│   │   └── components/
└── backend/           # Go 后端
    ├── handlers/      # HTTP 处理器
    ├── services/      # 业务逻辑服务
    ├── models/        # 数据模型
    └── db/           # 数据库连接
```

## 功能特性

### 前端功能
- **项目列表页面** (`/projects`): 显示所有仓库，支持搜索
- **Commits页面** (`/:provider/:org/:repo/commits`): 显示仓库的提交列表
- **Commit详情页面** (`/:provider/:org/:repo/commits/:sha`): 显示特定提交的覆盖率详情
- **覆盖率页面** (`/:provider/:org/:repo/coverage`): 显示覆盖率地图和文件详情

### 后端API
- **仓库管理**:
  - `GET /api/v1/repo` - 获取仓库列表
  - `GET /api/v1/repo/:repoID` - 获取仓库详情
  - `GET /api/v1/repo/:repoID/commits` - 获取仓库提交列表
  - `GET /api/v1/repo/:repoID/commits/:sha` - 获取提交详情

- **覆盖率数据**:
  - `GET /api/v1/coverage/map` - 获取覆盖率地图
  - `GET /api/v1/coverage/summary/map` - 获取覆盖率摘要

## 数据模型

基于 `old-packages/backend/prisma/schema.prisma` 中的模型：

### Coverage
```sql
model Coverage {
  id             String   @id @default(cuid())
  instrumentCwd  String   @map("instrument_cwd")
  sha            String   @map("sha")
  branch         String
  compareTarget  String   @map("compare_target")
  provider       String
  buildProvider  String   @map("build_provider")
  buildID        String   @map("build_id")
  repoID         String   @map("repo_id")
  reporter       String
  reportProvider String   @map("report_provider")
  reportID       String   @map("report_id")
  scopeID        String   @map("scope_id")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @default(now()) @map("updated_at")
}
```

### CoverageMapRelation
```sql
model CoverageMapRelation {
  id                  String @id @default(cuid())
  fullFilePath        String @map("full_file_path")
  filePath            String @map("file_path")
  restoreFullFilePath String @map("restore_full_file_path")
  coverageMapHashID   String @map("coverage_map_hash_id")
  coverageID          String @map("coverage_id")
  sourceMapHashID     String @map("source_map_hash_id")
}
```

## 运行项目

### 前端
```bash
cd packages/frontend
npm install
npm run dev
```

### 后端
```bash
cd packages/backend
go mod tidy
go run main.go
```

### 环境变量
创建 `packages/backend/.env` 文件：
```
DATABASE_URL=postgresql://username:password@localhost:5432/canyon_db
```

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design UI组件库
- React Router Dom 路由
- Ahooks 状态管理
- Axios HTTP客户端
- Tailwind CSS 样式

### 后端
- Go 1.24
- Gin Web框架
- GORM ORM
- PostgreSQL 数据库
- ClickHouse (用于覆盖率数据存储)

## 路由说明

前端使用 `vite-plugin-pages` 自动生成路由：
- `src/pages/` 目录映射到根路径
- `src/cov-pages/` 目录映射到 `:provider/:org/:repo` 路径

这样可以支持类似 `/gitlab/myorg/myrepo/commits` 的URL结构。