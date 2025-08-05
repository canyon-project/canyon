# Backend Service

这是一个使用 Go + Gin + PostgreSQL 构建的后端服务。

## 功能特性

- ✅ PostgreSQL 数据库连接
- ✅ 环境变量多路径加载
- ✅ GORM ORM 支持
- ✅ 连接池配置
- ✅ 健康检查接口
- ✅ CORS 跨域支持
- ✅ 错误处理中间件
- ✅ 结构化日志

## 环境变量

服务会按以下顺序尝试加载环境变量文件：

1. `.env` (当前目录)
2. `/opt/app/.env` (部署目录)
3. `../../.env` (上级目录)

### 必需的环境变量

```env
DATABASE_URL=postgres://username:password@host:port/database
```

### 可选的环境变量

```env
PORT=8080
CLICKHOUSE_HOST=your_clickhouse_host
CLICKHOUSE_USER=your_clickhouse_user
CLICKHOUSE_PASSWORD=your_clickhouse_password
CLICKHOUSE_DATABASE=default
```

## 快速开始

1. 安装依赖：
```bash
go mod tidy
```

2. 设置环境变量（创建 .env 文件或设置系统环境变量）

3. 运行服务：
```bash
go run main.go
```

4. 或者指定端口和日志文件：
```bash
go run main.go -port=8080 -log=./logs/app.log
```

## API 接口

### 健康检查
```
GET /health
GET /api/v1/health
```

返回示例：
```json
{
  "status": "ok",
  "message": "服务运行正常",
  "service": "backend",
  "database": "connected"
}
```

## 项目结构

```
packages/backend/
├── main.go              # 主入口文件（简洁版）
├── config/              # 配置管理
│   └── config.go
├── db/                  # 数据库连接
│   └── database.go
├── dto/                 # 数据传输对象
│   └── coverage_query.go
├── handlers/            # HTTP请求处理器（Go风格）
│   ├── coverage.go      # 覆盖率相关处理器
│   ├── health.go        # 健康检查
│   ├── repo.go          # 仓库相关处理器
│   └── handlers_test.go # 测试文件
├── middleware/          # 中间件
│   ├── cors.go          # 跨域处理
│   ├── error.go         # 错误处理
│   └── static.go        # 静态文件处理
├── models/              # 数据模型
│   └── base.go
├── routes/              # 路由配置
│   └── routes.go
├── server/              # 服务器管理
│   └── server.go
├── services/            # 业务逻辑层
│   ├── coverage.go      # 覆盖率相关服务
│   ├── database.go      # 数据库服务
│   └── repo.go          # 仓库相关服务
├── utils/               # 工具函数
│   ├── coverage.go      # 覆盖率数据处理工具
│   └── logger.go        # 日志工具
└── README.md
```

## API 接口

### Repository APIs
- `GET /api/repo?keyword=xxx` - 获取仓库列表
- `GET /api/repo/:repoID` - 获取仓库详情  
- `GET /api/repo/:repoID/commits` - 获取提交记录
- `GET /api/repo/:repoID/commits/:sha` - 获取提交详情

### Coverage APIs
- `GET /api/coverage/map` - 获取覆盖率映射
- `GET /api/coverage/summary/map` - 获取覆盖率摘要映射

查询参数：
- `provider` - 提供商
- `repoID` - 仓库ID
- `sha` - 提交SHA
- `buildProvider` - 构建提供商
- `buildID` - 构建ID
- `reportProvider` - 报告提供商
- `reportID` - 报告ID
- `filePath` - 文件路径

## 数据库

使用 GORM 作为 ORM，支持：

- 自动迁移
- 连接池管理
- 健康检查
- 事务支持

### 添加新模型

1. 在 `models/` 目录下创建模型文件
2. 在 `db/database.go` 的 `AutoMigrate()` 函数中添加模型
3. 取消注释自动迁移代码

## 部署

### Docker 部署

确保 Dockerfile 中包含环境变量文件路径配置。

### 生产环境

建议设置以下环境变量：
- `GIN_MODE=release`
- 适当的数据库连接池参数
- 日志文件路径

## 开发

### 添加新的 API 接口

1. 在 `handlers/` 目录下创建处理器
2. 在 `routes/routes.go` 中添加路由
3. 如需要，在 `services/` 中添加业务逻辑

### 中间件

所有中间件都在 `middleware/` 目录下，当前包含：
- CORS 跨域处理
- 错误处理和恢复

## 监控

服务提供健康检查接口，可用于：
- 负载均衡器健康检查
- 容器编排健康检查
- 监控系统集成