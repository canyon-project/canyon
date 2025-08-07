package routes

import (
	"backend/handlers"
	"backend/services"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	// Swagger 文档路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API 路由组
	api := r.Group("/api")
	{
		// Repository 路由
		repo := api.Group("/repo")
		{
			// @Summary 获取仓库列表
			// @Description 根据关键词搜索仓库列表
			// @Tags repository
			// @Accept json
			// @Produce json
			// @Param keyword query string false "搜索关键词"
			// @Success 200 {object} map[string]interface{}
			// @Failure 400 {object} map[string]interface{}
			// @Failure 500 {object} map[string]interface{}
			// @Router /repo [get]
			repo.GET("", repoHandler.GetRepos)

			// @Summary 根据仓库ID获取仓库信息
			// @Description 根据仓库ID获取详细的仓库信息
			// @Tags repository
			// @Accept json
			// @Produce json
			// @Param repoID path string true "仓库ID"
			// @Success 200 {object} map[string]interface{}
			// @Failure 400 {object} map[string]interface{}
			// @Failure 500 {object} map[string]interface{}
			// @Router /repo/{repoID} [get]
			repo.GET("/:repoID", repoHandler.GetRepoByID)

			// @Summary 获取仓库提交记录
			// @Description 获取指定仓库的提交记录列表
			// @Tags repository
			// @Accept json
			// @Produce json
			// @Param repoID path string true "仓库ID"
			// @Success 200 {object} map[string]interface{}
			// @Failure 400 {object} map[string]interface{}
			// @Failure 500 {object} map[string]interface{}
			// @Router /repo/{repoID}/commits [get]
			repo.GET("/:repoID/commits", repoHandler.GetRepoCommits)
		}

		// Coverage 路由
		coverage := api.Group("/coverage")
		{
			// Overview 路由组
			overview := coverage.Group("/overview")
			{
				// @Summary 获取一个commit的覆盖率概览
				// @Description 根据仓库ID和SHA获取覆盖率摘要信息
				// @Tags coverage
				// @Accept json
				// @Produce json
				// @Param provider query string true "提供商"
				// @Param repoID query string true "仓库ID"
				// @Param sha query string true "提交SHA"
				// @Param buildProvider query string false "构建提供商"
				// @Param buildID query string false "构建ID"
				// @Param reportProvider query string false "报告提供商"
				// @Param reportID query string false "报告ID"
				// @Param filePath query string false "文件路径"
				// @Success 200 {object} map[string]interface{}
				// @Failure 400 {object} map[string]interface{}
				// @Failure 500 {object} map[string]interface{}
				// @Router /coverage/overview/commits [get]
				overview.GET("/commits", coverageHandler.GetCoverageSummary)

				// @Summary 获取一个pull request的覆盖率概览
				// @Description 根据仓库ID和PR号获取指定pull request的覆盖率概览信息
				// @Tags coverage
				// @Accept json
				// @Produce json
				// @Param provider query string true "提供商名称" example(github)
				// @Param repoID query string true "仓库ID" example(owner/repo)
				// @Param pullNumber query string true "PR号" example(123)
				// @Param buildProvider query string false "构建提供商" example(jenkins)
				// @Param buildID query string false "构建ID" example(build-123)
				// @Param reportProvider query string false "报告提供商" example(jest)
				// @Param reportID query string false "报告ID" example(report-456)
				// @Param filePath query string false "文件路径" example(src/main.go)
				// @Success 200 {object} map[string]interface{} "PR覆盖率概览信息"
				// @Failure 400 {object} map[string]interface{} "请求参数错误"
				// @Failure 500 {object} map[string]interface{} "服务器内部错误"
				// @Router /coverage/overview/pulls [get]
				overview.GET("/pulls", coverageHandler.GetCoverageSummaryForPull)

				// @Summary 获取多个commits的覆盖率概览
				// @Description 根据仓库ID和多个SHA获取指定commits的覆盖率概览信息
				// @Tags coverage
				// @Accept json
				// @Produce json
				// @Param provider query string true "提供商名称" example(github)
				// @Param repoID query string true "仓库ID" example(owner/repo)
				// @Param shas query string true "提交SHA列表，用逗号分隔" example(abc123def456,def456ghi789)
				// @Param buildProvider query string false "构建提供商" example(jenkins)
				// @Param buildID query string false "构建ID" example(build-123)
				// @Param reportProvider query string false "报告提供商" example(jest)
				// @Param reportID query string false "报告ID" example(report-456)
				// @Param filePath query string false "文件路径" example(src/main.go)
				// @Success 200 {object} map[string]interface{} "多commits覆盖率概览信息"
				// @Failure 400 {object} map[string]interface{} "请求参数错误"
				// @Failure 500 {object} map[string]interface{} "服务器内部错误"
				// @Router /coverage/overview/multiple-commits [get]
				overview.GET("/multiple-commits", coverageHandler.GetCoverageSummaryForCommits)
			}

			// @Summary 获取覆盖率摘要映射
			// @Description 获取覆盖率数据的摘要映射
			// @Tags coverage
			// @Accept json
			// @Produce json
			// @Param provider query string true "提供商"
			// @Param repoID query string true "仓库ID"
			// @Param sha query string true "提交SHA"
			// @Param buildProvider query string false "构建提供商"
			// @Param buildID query string false "构建ID"
			// @Param reportProvider query string false "报告提供商"
			// @Param reportID query string false "报告ID"
			// @Param filePath query string false "文件路径"
			// @Success 200 {object} map[string]interface{}
			// @Failure 400 {object} map[string]interface{}
			// @Failure 500 {object} map[string]interface{}
			// @Router /coverage/summary/map [get]
			coverage.GET("/summary/map", coverageHandler.GetCoverageSummaryMap)

			// @Summary 获取覆盖率映射
			// @Description 获取详细的覆盖率映射数据
			// @Tags coverage
			// @Accept json
			// @Produce json
			// @Param provider query string true "提供商"
			// @Param repoID query string true "仓库ID"
			// @Param sha query string true "提交SHA"
			// @Param buildProvider query string false "构建提供商"
			// @Param buildID query string false "构建ID"
			// @Param reportProvider query string false "报告提供商"
			// @Param reportID query string false "报告ID"
			// @Param filePath query string false "文件路径"
			// @Success 200 {object} map[string]interface{}
			// @Failure 400 {object} map[string]interface{}
			// @Failure 500 {object} map[string]interface{}
			// @Router /coverage/map [get]
			coverage.GET("/map", coverageHandler.GetCoverageMap)
		}
	}
}
