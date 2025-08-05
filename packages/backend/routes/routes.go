package routes

import (
	"backend/handlers"
	"backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes 设置所有路由
func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	// 初始化服务
	repoService := services.NewRepoService()
	coverageService := services.NewCoverageService()

	// 初始化处理器
	repoHandler := handlers.NewRepoHandler(repoService)
	coverageHandler := handlers.NewCoverageHandler(coverageService)

	// 健康检查接口(别改我！！！)
	r.GET("/vi/health", handlers.HealthCheck)

	// Repository 路由
	r.GET("/api/repo", repoHandler.GetRepos)
	r.GET("/api/repo/:repoID", repoHandler.GetRepoByID)
	r.GET("/api/repo/:repoID/commits", repoHandler.GetRepoCommits)
	r.GET("/api/repo/:repoID/commits/:sha", repoHandler.GetRepoCommitBySHA)

	// Coverage 路由
	r.GET("/api/coverage/summary/map", coverageHandler.GetCoverageSummaryMap)
	r.GET("/api/coverage/map", coverageHandler.GetCoverageMap)



	// API v1 路由组（保持兼容性）
	api := r.Group("/api/v1")
	{
		api.GET("/health", handlers.HealthCheck)
	}
}

// SetupCoverageRoutes 保持向后兼容
// @Deprecated: 使用 SetupRoutes 替代
func SetupCoverageRoutes(r *gin.Engine, db *gorm.DB) {
	SetupRoutes(r, db)
}