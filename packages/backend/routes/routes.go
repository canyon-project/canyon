package routes

import (
	"backend/handlers"
	"backend/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 设置所有路由
func SetupRoutes(r *gin.Engine) {
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
}
