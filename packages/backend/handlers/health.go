package handlers

import (
	"backend/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheck 健康检查处理器
func HealthCheck(c *gin.Context) {
	response := gin.H{
		"status":  "ok",
		"message": "服务运行正常",
		"service": "backend",
	}

	// 检查PostgreSQL数据库连接
	if err := db.HealthCheck(); err != nil {
		response["status"] = "error"
		response["message"] = "PostgreSQL连接失败"
		response["postgres_error"] = err.Error()
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}
	response["postgres"] = "connected"

	// 检查ClickHouse连接（如果配置了的话）
	if err := db.ClickHouseHealthCheck(); err != nil {
		response["clickhouse"] = "disconnected"
		response["clickhouse_error"] = err.Error()
		// ClickHouse连接失败不影响整体服务状态，只是记录状态
	} else {
		response["clickhouse"] = "connected"
	}

	c.JSON(http.StatusOK, response)
}
