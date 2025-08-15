package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 设置所有路由
func SetupRoutes(r *gin.Engine) {
	// 全局中间件
	r.Use(middleware.RequestIDMiddleware())

	// 初始化服务
	repoService := services.NewRepoService()
	coverageService := services.NewCoverageService()
	gitlabService := services.NewGitLabService()
	configService := services.NewConfigService()

	// 初始化处理器
	repoHandler := handlers.NewRepoHandler(repoService)
	coverageHandler := handlers.NewCoverageHandler(coverageService)
	codeHandler := handlers.NewCodeHandler(gitlabService)
	configHandler := handlers.NewConfigHandler(configService)

	// 健康检查接口(别改我！！！)
	r.GET("/vi/health", handlers.HealthCheck)

	// API 路由组
	api := r.Group("/api")
	{
		// Repository 路由
		repo := api.Group("/repo")
		{
			repo.GET("", repoHandler.GetRepos)
			repo.GET("/:repoID", repoHandler.GetRepoByID)
			repo.GET("/:repoID/commits", repoHandler.GetRepoCommits)
			repo.GET("/:repoID/pulls", repoHandler.GetRepoPulls)
			repo.GET("/:repoID/commits/:sha", repoHandler.GetRepoCommitBySHA)
		}

		// Code 路由
		code := api.Group("/code")
		{
			code.GET("", codeHandler.GetFileContent)
			code.GET("/pulls/:projectID/:pullRequestID", codeHandler.GetPullRequest)
			code.GET("/pulls/:projectID/:pullRequestID/changes", codeHandler.GetPullRequestChanges)
			code.GET("/projects/:path", codeHandler.GetProjectByPath)
		}

		// Coverage 路由
		coverage := api.Group("/coverage")
		{
			// 新的主要接口
			coverage.GET("/overview/commits", coverageHandler.GetCoverageSummary)
			coverage.GET("/summary/map", coverageHandler.GetCoverageSummaryMap)
			coverage.GET("/map", coverageHandler.GetCoverageMap)
			coverage.GET("/overview/pulls", coverageHandler.GetCoverageSummaryForPull)
			coverage.GET("/overview/multiple-commits", coverageHandler.GetCoverageSummaryForCommits)
			coverage.GET("/map/multiple-commits", coverageHandler.GetCoverageMapForMultipleCommits)
			coverage.GET("/summary/map/multiple-commits", coverageHandler.GetCoverageSummaryMapForMultipleCommits)

			// 统一入口：subject/subjectID
			coverage.GET("/overview", coverageHandler.GetCoverageOverviewBySubject)
			coverage.GET("/summary/map/subject", coverageHandler.GetCoverageSummaryMapBySubject)
			coverage.GET("/map/subject", coverageHandler.GetCoverageMapBySubject)
		}

		// Config 路由
		config := api.Group("/config")
		{
			config.GET("", configHandler.GetAllConfigs)
			config.GET("/:key", configHandler.GetConfigByKey)
			config.POST("", configHandler.CreateConfig)
			config.PUT("/:key", configHandler.UpdateConfig)
			config.DELETE("/:key", configHandler.DeleteConfig)
			config.POST("/init", configHandler.InitConfigs)
		}
	}
}
