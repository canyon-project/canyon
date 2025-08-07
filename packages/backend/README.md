# Canyon Backend API

Canyon 代码覆盖率管理平台后端 API 服务。

## 功能特性

- 代码覆盖率数据管理
- 仓库信息管理
- 提交记录管理
- 健康检查
- Swagger API 文档

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

或者指定端口：

```bash
go run main.go -port 8080
```

## API 文档

### Swagger UI

启动服务后，访问 Swagger UI：

```
http://localhost:8080/swagger/index.html
```

### API 端点

#### 健康检查
- `GET /vi/health` - 服务健康状态检查

#### 仓库管理
- `GET /api/repo` - 获取仓库列表
- `GET /api/repo/{repoID}` - 根据仓库ID获取仓库信息
- `GET /api/repo/{repoID}/commits` - 获取仓库提交记录

#### 覆盖率管理
- `GET /api/coverage/summary` - 获取一个commit的覆盖率概览
- `GET /api/coverage/summary/map` - 获取覆盖率摘要映射
- `GET /api/coverage/map` - 获取覆盖率映射

## 开发

### 添加新的 API 端点

1. 在 `handlers` 包中创建新的处理器
2. 在 `routes/routes.go` 中添加路由
3. 添加 Swagger 注释
4. 更新文档

### Swagger 注释示例

```go
// @Summary 获取用户信息
// @Description 根据用户ID获取用户详细信息
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /users/{id} [get]
func GetUser(c *gin.Context) {
    // 实现逻辑
}
```

### 重新生成 Swagger 文档

如果修改了 API 注释，需要重新生成文档：

```bash
swag init
```
