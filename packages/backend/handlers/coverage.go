package handlers

import (
	"backend/dto"
	"backend/services"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CoverageHandler 覆盖率处理器
type CoverageHandler struct {
	coverageService *services.CoverageService
}

// NewCoverageHandler 创建覆盖率处理器
func NewCoverageHandler(coverageService *services.CoverageService) *CoverageHandler {
	return &CoverageHandler{
		coverageService: coverageService,
	}
}

// GetCoverageSummary 获取一个commit的覆盖率概览 - 新的主要接口
// @Summary 获取一个commit的覆盖率概览
// @Description 根据仓库ID和SHA获取指定commit的覆盖率概览信息，包括总体覆盖率统计和构建组信息
// @Tags coverage
// @Accept json
// @Produce json
// @Param provider query string true "提供商名称" example(github)
// @Param repoID query string true "仓库ID" example(owner/repo)
// @Param sha query string true "提交SHA" example(abc123def456)
// @Param buildProvider query string false "构建提供商" example(jenkins)
// @Param buildID query string false "构建ID" example(build-123)
// @Param reportProvider query string false "报告提供商" example(jest)
// @Param reportID query string false "报告ID" example(report-456)
// @Param filePath query string false "文件路径" example(src/main.go)
// @Success 200 {object} map[string]interface{} "覆盖率概览信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /coverage/overview/commits [get]
func (h *CoverageHandler) GetCoverageSummary(c *gin.Context) {
	var query dto.CoverageSummaryQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and sha are required",
		})
		return
	}

	// 调用新的服务方法获取覆盖率摘要
	result, err := h.coverageService.GetCoverageSummaryByRepoAndSHA(query.RepoID, query.SHA)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryMap 获取覆盖率摘要映射
// @Summary 获取覆盖率摘要映射
// @Description 获取覆盖率数据的摘要映射，包含文件级别的覆盖率统计信息
// @Tags coverage
// @Accept json
// @Produce json
// @Param provider query string true "提供商名称" example(github)
// @Param repoID query string true "仓库ID" example(owner/repo)
// @Param sha query string true "提交SHA" example(abc123def456)
// @Param buildProvider query string false "构建提供商" example(jenkins)
// @Param buildID query string false "构建ID" example(build-123)
// @Param reportProvider query string false "报告提供商" example(jest)
// @Param reportID query string false "报告ID" example(report-456)
// @Param filePath query string false "文件路径" example(src/main.go)
// @Success 200 {object} map[string]interface{} "覆盖率摘要映射"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /coverage/summary/map [get]
func (h *CoverageHandler) GetCoverageSummaryMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 调用服务获取覆盖率数据
	coverageMap, err := h.coverageService.GetCoverageMap(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 生成摘要映射 (对应 NestJS 中的 genSummaryMapByCoverageMap)
	summaryMap := utils.GenSummaryMapByCoverageMap(coverageMap)

	c.JSON(http.StatusOK, summaryMap)
}

// GetCoverageMap 获取覆盖率映射
// @Summary 获取覆盖率映射
// @Description 获取详细的覆盖率映射数据，包含语句、函数、分支等详细的覆盖率信息
// @Tags coverage
// @Accept json
// @Produce json
// @Param provider query string true "提供商名称" example(github)
// @Param repoID query string true "仓库ID" example(owner/repo)
// @Param sha query string true "提交SHA" example(abc123def456)
// @Param buildProvider query string false "构建提供商" example(jenkins)
// @Param buildID query string false "构建ID" example(build-123)
// @Param reportProvider query string false "报告提供商" example(jest)
// @Param reportID query string false "报告ID" example(report-456)
// @Param filePath query string false "文件路径" example(src/main.go)
// @Success 200 {object} map[string]interface{} "覆盖率映射数据"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /coverage/map [get]
func (h *CoverageHandler) GetCoverageMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and sha are required",
		})
		return
	}

	// 调用服务获取覆盖率映射数据
	result, err := h.coverageService.GetCoverageMap(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryForPull 获取一个pull request的覆盖率概览
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
func (h *CoverageHandler) GetCoverageSummaryForPull(c *gin.Context) {
	var query dto.CoveragePullQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.PullNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and pullNumber are required",
		})
		return
	}

	// TODO: 实现获取PR覆盖率概览的逻辑
	c.JSON(http.StatusOK, gin.H{
		"message": "TODO: 实现获取PR覆盖率概览的功能",
		"status":  "not_implemented",
		"params":  query,
	})
}

// GetCoverageSummaryForCommits 获取多个commits的覆盖率概览
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
func (h *CoverageHandler) GetCoverageSummaryForCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and shas are required",
		})
		return
	}

	// TODO: 实现获取多个commits覆盖率概览的逻辑
	c.JSON(http.StatusOK, gin.H{
		"message": "TODO: 实现获取多个commits覆盖率概览的功能",
		"status":  "not_implemented",
		"params":  query,
	})
}

// GetCoverageMapForPull 获取PR的覆盖率映射
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
func (h *CoverageHandler) GetCoverageMapForPull(c *gin.Context) {
	var query dto.CoveragePullMapQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.PullNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and pullNumber are required",
		})
		return
	}

	// 准备请求ID，并回写到响应头，便于链路追踪
	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	// 调用服务获取PR覆盖率映射数据
	result, err := h.coverageService.GetCoverageMapForPull(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
