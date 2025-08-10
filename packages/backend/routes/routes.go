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
	configService := services.NewConfigService()
	gitlabService := services.NewGitLabService()

	// 初始化处理器
	repoHandler := handlers.NewRepoHandler(repoService)
	coverageHandler := handlers.NewCoverageHandler(coverageService)
	configHandler := handlers.NewConfigHandler(configService)
	codeHandler := handlers.NewCodeHandler(gitlabService)

	// 健康检查接口(别改我！！！)
	r.GET("/vi/health", handlers.HealthCheck)

	// 移除 Swagger 文档路由

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
		}

		// Code 路由
		code := api.Group("/code")
		{
			code.GET("", codeHandler.GetFileContent)

			code.GET("/pulls/:projectID/:pullRequestID", codeHandler.GetPullRequest)

			code.GET("/pulls/:projectID/:pullRequestID/changes", codeHandler.GetPullRequestChanges)

			code.GET("/projects/:path", codeHandler.GetProjectByPath)
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

		// Coverage 路由
		coverage := api.Group("/coverage")
		{
			// Overview 统一入口：subject/subjectID
			// 统一入口：subject、subjectID 走 query 参数
			coverage.GET("/overview", coverageHandler.GetCoverageOverviewBySubject)
			coverage.GET("/summary/map", coverageHandler.GetCoverageSummaryMapBySubject)
			coverage.GET("/map", coverageHandler.GetCoverageMapBySubject)
		}
	}
}
