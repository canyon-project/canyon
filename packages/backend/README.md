# Canyon Backend API

Canyon 代码覆盖率管理平台后端 API 服务。

## 功能特性

- 代码覆盖率数据管理
- 仓库信息管理
- 提交记录管理
- 健康检查

## 快速开始

### 环境要求

- Go 1.24+
- PostgreSQL
- ClickHouse

### 安装依赖

```bash
go mod tidy
```

### 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL=postgres://username:password@localhost:5432/canyon?sslmode=disable
CLICKHOUSE_HOST=localhost:9000
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default
PORT=8080
```

### 运行服务

```bash
go run main.go
```
