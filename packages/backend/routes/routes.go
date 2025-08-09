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
	configService := services.NewConfigService()
	gitlabService := services.NewGitLabService()

	// 初始化处理器
	repoHandler := handlers.NewRepoHandler(repoService)
	coverageHandler := handlers.NewCoverageHandler(coverageService)
	configHandler := handlers.NewConfigHandler(configService)
	codeHandler := handlers.NewCodeHandler(gitlabService)

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

			// @Summary 获取仓库关联覆盖率的Pull Requests
			// @Description 基于覆盖率表中存在的commit，查询关联到的Pull Requests 并去重返回
			// @Tags repository
			// @Accept json
			// @Produce json
			// @Param repoID path string true "仓库ID"
			// @Success 200 {object} map[string]interface{} "Pull Request 列表"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /repo/{repoID}/pulls [get]
			repo.GET("/:repoID/pulls", repoHandler.GetRepoPulls)
		}

		// Code 路由
		code := api.Group("/code")
		{
			// @Summary 获取指定提交下的文件内容
			// @Description 根据仓库ID、提交SHA与文件路径获取该文件在该提交下的内容（Base64 编码）
			// @Tags code
			// @Accept json
			// @Produce json
			// @Param repoID query int true "仓库ID"
			// @Param sha query string true "提交SHA"
			// @Param filepath query string true "文件路径（URL 编码或普通路径均可）"
			// @Success 200 {object} map[string]interface{} "文件内容（content 字段为 Base64 编码）"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /code [get]
			code.GET("", codeHandler.GetFileContent)

			// @Summary 获取Pull Request信息
			// @Description 根据项目ID和Pull Request ID获取详细信息
			// @Tags code
			// @Accept json
			// @Produce json
			// @Param projectID path int true "项目ID"
			// @Param pullRequestID path int true "Pull Request ID"
			// @Success 200 {object} services.GitLabPullRequest "Pull Request信息"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /code/pulls/{projectID}/{pullRequestID} [get]
			code.GET("/pulls/:projectID/:pullRequestID", codeHandler.GetPullRequest)

			// @Summary 获取Pull Request变更信息
			// @Description 根据项目ID和Pull Request ID获取变更详情
			// @Tags code
			// @Accept json
			// @Produce json
			// @Param projectID path int true "项目ID"
			// @Param pullRequestID path int true "Pull Request ID"
			// @Success 200 {array} map[string]interface{} "变更信息"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /code/pulls/{projectID}/{pullRequestID}/changes [get]
			code.GET("/pulls/:projectID/:pullRequestID/changes", codeHandler.GetPullRequestChanges)

			// @Summary 根据路径获取项目信息
			// @Description 根据项目路径获取项目详细信息
			// @Tags code
			// @Accept json
			// @Produce json
			// @Param path path string true "项目路径"
			// @Success 200 {object} map[string]interface{} "项目信息"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /code/projects/{path} [get]
			code.GET("/projects/:path", codeHandler.GetProjectByPath)
		}

		// Config 路由
		config := api.Group("/config")
		{
			// @Summary 获取所有配置
			// @Description 获取系统中的所有配置项
			// @Tags config
			// @Accept json
			// @Produce json
			// @Success 200 {array} models.Config "配置列表"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config [get]
			config.GET("", configHandler.GetAllConfigs)

			// @Summary 根据key获取配置
			// @Description 根据配置key获取对应的配置值
			// @Tags config
			// @Accept json
			// @Produce json
			// @Param key path string true "配置key"
			// @Success 200 {object} models.Config "配置信息"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 404 {object} map[string]interface{} "配置不存在"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config/{key} [get]
			config.GET("/:key", configHandler.GetConfigByKey)

			// @Summary 创建配置
			// @Description 创建新的配置项
			// @Tags config
			// @Accept json
			// @Produce json
			// @Param config body map[string]string true "配置信息"
			// @Success 201 {object} models.Config "创建的配置"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config [post]
			config.POST("", configHandler.CreateConfig)

			// @Summary 更新配置
			// @Description 更新指定key的配置值
			// @Tags config
			// @Accept json
			// @Produce json
			// @Param key path string true "配置key"
			// @Param config body map[string]string true "配置信息"
			// @Success 200 {object} models.Config "更新后的配置"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 404 {object} map[string]interface{} "配置不存在"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config/{key} [put]
			config.PUT("/:key", configHandler.UpdateConfig)

			// @Summary 删除配置
			// @Description 删除指定key的配置项
			// @Tags config
			// @Accept json
			// @Produce json
			// @Param key path string true "配置key"
			// @Success 200 {object} map[string]interface{} "删除成功"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config/{key} [delete]
			config.DELETE("/:key", configHandler.DeleteConfig)

			// @Summary 初始化配置
			// @Description 从配置文件加载默认配置到数据库
			// @Tags config
			// @Accept json
			// @Produce json
			// @Success 200 {object} map[string]interface{} "初始化成功"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /config/init [post]
			config.POST("/init", configHandler.InitConfigs)
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

			// @Summary 获取PR的覆盖率映射
			// @Description 根据PR号获取该PR包含的所有commits的详细覆盖率映射数据
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
			// @Success 200 {object} map[string]interface{} "PR覆盖率映射数据"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /coverage/map/pull [get]
			coverage.GET("/map/pull", coverageHandler.GetCoverageMapForPull)

			// @Summary 获取PR的覆盖率摘要映射
			// @Description 根据PR号获取该PR包含的所有commits的覆盖率摘要（每文件统计 totals/covered/pct）
			// @Tags coverage
			// @Accept json
			// @Produce json
			// @Param provider query string true "提供商名称" example(github)
			// @Param repoID query string true "仓库ID" example(owner/repo)
			// @Param pullNumber query string true "PR号" example(123)
			// @Param filePath query string false "文件路径" example(src/main.go)
			// @Success 200 {object} map[string]interface{} "PR覆盖率摘要映射数据"
			// @Failure 400 {object} map[string]interface{} "请求参数错误"
			// @Failure 500 {object} map[string]interface{} "服务器内部错误"
			// @Router /coverage/summary/map/pull [get]
			coverage.GET("/summary/map/pull", coverageHandler.GetCoverageSummaryMapForPull)

			// 多 commits 覆盖率（映射 & 摘要映射）
			// @Router /coverage/map/multiple-commits [get]
			coverage.GET("/map/multiple-commits", coverageHandler.GetCoverageMapForMultipleCommits)
			// @Router /coverage/summary/map/multiple-commits [get]
			coverage.GET("/summary/map/multiple-commits", coverageHandler.GetCoverageSummaryMapForMultipleCommits)
		}
	}
}
