package handlers

import (
	"backend/dto"
	"backend/services"
	"backend/utils"
	"net/http"
	"time"

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
func (h *CoverageHandler) GetCoverageSummary(c *gin.Context) {
	var query dto.CoverageSummaryQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 准备请求ID，并回写到响应头
	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and sha are required",
		})
		return
	}

	stepStart := time.Now()
	reqLog := services.NewRequestLogService()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/commits", "GET", 0, query.RequestID, query.RequestID, "summary-start", "", "INFO", "handle GetCoverageSummary start", map[string]interface{}{"repoID": query.RepoID, "sha": query.SHA}, nil, query.RepoID, query.SHA, stepStart, time.Now())

	// 调用新的服务方法获取覆盖率摘要
	result, err := h.coverageService.GetCoverageSummaryByRepoAndSHA(query.RepoID, query.SHA)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/commits", "GET", http.StatusInternalServerError, query.RequestID, query.RequestID, "summary-error", "summary-start", "ERROR", "GetCoverageSummaryByRepoAndSHA failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, stepStart, time.Now())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/commits", "GET", http.StatusOK, query.RequestID, query.RequestID, "summary-done", "summary-start", "INFO", "GetCoverageSummary done", map[string]interface{}{"items": 1}, nil, query.RepoID, query.SHA, stepStart, time.Now())
	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryMap 获取覆盖率摘要映射
func (h *CoverageHandler) GetCoverageSummaryMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	stepStart := time.Now()
	reqLog := services.NewRequestLogService()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/summary/map", "GET", 0, query.RequestID, query.RequestID, "summary-map-start", "", "INFO", "handle GetCoverageSummaryMap start", map[string]interface{}{"repoID": query.RepoID, "sha": query.SHA}, nil, query.RepoID, query.SHA, stepStart, time.Now())

	// 调用服务直接在数据库计算摘要（深度优化版本）
	summaryMap, err := h.coverageService.GetCoverageSummaryMapFast(query)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/summary/map", "GET", http.StatusInternalServerError, query.RequestID, query.RequestID, "summary-map-error", "summary-map-start", "ERROR", "GetCoverageSummaryMapFast failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, stepStart, time.Now())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/summary/map", "GET", http.StatusOK, query.RequestID, query.RequestID, "summary-map-done", "summary-map-start", "INFO", "GetCoverageSummaryMap done", map[string]interface{}{"files": len(summaryMap)}, nil, query.RepoID, query.SHA, stepStart, time.Now())
	c.JSON(http.StatusOK, summaryMap)
}

// GetCoverageMap 获取覆盖率映射
func (h *CoverageHandler) GetCoverageMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and sha are required",
		})
		return
	}

	stepStart := time.Now()
	reqLog := services.NewRequestLogService()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 0, query.RequestID, query.RequestID, "map-start", "", "INFO", "handle GetCoverageMap start", map[string]interface{}{"repoID": query.RepoID, "sha": query.SHA}, nil, query.RepoID, query.SHA, stepStart, time.Now())

	// 调用服务获取覆盖率映射数据
	result, err := h.coverageService.GetCoverageMap(query)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", http.StatusInternalServerError, query.RequestID, query.RequestID, "map-error", "map-start", "ERROR", "GetCoverageMap failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, stepStart, time.Now())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", http.StatusOK, query.RequestID, query.RequestID, "map-done", "map-start", "INFO", "GetCoverageMap done", map[string]interface{}{"entries": 1}, nil, query.RepoID, query.SHA, stepStart, time.Now())
	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryForPull 获取一个pull request的覆盖率概览
func (h *CoverageHandler) GetCoverageSummaryForPull(c *gin.Context) {
	var query dto.CoveragePullQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.PullNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and pullNumber are required",
		})
		return
	}

	stepStart := time.Now()
	reqLog := services.NewRequestLogService()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, query.RequestID, query.RequestID, "pull-summary-start", "", "INFO", "handle GetCoverageSummaryForPull start", map[string]interface{}{"repoID": query.RepoID, "pull": query.PullNumber}, nil, query.RepoID, "", stepStart, time.Now())

	// 获取PR覆盖率概览（合并所有构建，不区分buildID/buildProvider）
	result, err := h.coverageService.GetCoverageSummaryForPull(query)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", http.StatusInternalServerError, query.RequestID, query.RequestID, "pull-summary-error", "pull-summary-start", "ERROR", "GetCoverageSummaryForPull failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", http.StatusOK, query.RequestID, query.RequestID, "pull-summary-done", "pull-summary-start", "INFO", "GetCoverageSummaryForPull done", nil, nil, query.RepoID, "", stepStart, time.Now())
	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryForCommits 获取多个commits的覆盖率概览
func (h *CoverageHandler) GetCoverageSummaryForCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and shas are required",
		})
		return
	}

	stepStart := time.Now()
	reqLog := services.NewRequestLogService()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/multiple-commits", "GET", 0, query.RequestID, query.RequestID, "multi-summary-start", "", "INFO", "handle GetCoverageSummaryForCommits start", map[string]interface{}{"repoID": query.RepoID, "shas": query.SHAs}, nil, query.RepoID, "", stepStart, time.Now())

	// TODO: 实现获取多个commits覆盖率概览的逻辑
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/multiple-commits", "GET", http.StatusOK, query.RequestID, query.RequestID, "multi-summary-done", "multi-summary-start", "INFO", "GetCoverageSummaryForCommits not implemented", nil, nil, query.RepoID, "", stepStart, time.Now())
	c.JSON(http.StatusOK, gin.H{
		"message": "TODO: 实现获取多个commits覆盖率概览的功能",
		"status":  "not_implemented",
		"params":  query,
	})
}

// GetCoverageOverviewBySubject 统一入口：根据 subject/subjectID 获取覆盖率概览
func (h *CoverageHandler) GetCoverageOverviewBySubject(c *gin.Context) {
	subject := c.Query("subject")     // commit | pull | multiple-commits
	subjectID := c.Query("subjectID") // sha | pullNumber | shas (comma)
	provider := c.Query("provider")
	repoID := c.Query("repoID")
	if provider == "" || repoID == "" || subject == "" || subjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider, repoID, subject, subjectID are required"})
		return
	}

	switch subject {
	case "commit", "commits":
		result, err := h.coverageService.GetCoverageSummaryByRepoAndSHA(repoID, subjectID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "pull", "pulls":
		// 复用现有 PR 概览
		var q dto.CoveragePullQueryDto
		q.Provider = provider
		q.RepoID = repoID
		q.PullNumber = subjectID
		result, err := h.coverageService.GetCoverageSummaryForPull(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "multiple-commits", "multi-commits":
		c.JSON(http.StatusBadRequest, gin.H{"error": "overview for multiple-commits is not supported yet"})
		return
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject"})
		return
	}
}

// GetCoverageSummaryMapBySubject 统一入口：根据 subject/subjectID 获取覆盖率摘要映射
func (h *CoverageHandler) GetCoverageSummaryMapBySubject(c *gin.Context) {
	subject := c.Query("subject")
	subjectID := c.Query("subjectID")
	provider := c.Query("provider")
	repoID := c.Query("repoID")
	filePath := c.Query("filePath")
	if provider == "" || repoID == "" || subject == "" || subjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider, repoID, subject, subjectID are required"})
		return
	}

	switch subject {
	case "commit", "commits":
		q := dto.CoverageQueryDto{Provider: provider, RepoID: repoID, SHA: subjectID, FilePath: filePath}
		result, err := h.coverageService.GetCoverageSummaryMapFast(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "pull", "pulls":
		q := dto.CoveragePullMapQueryDto{Provider: provider, RepoID: repoID, PullNumber: subjectID, FilePath: filePath}
		result, err := h.coverageService.GetCoverageSummaryMapForPull(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "multiple-commits", "multi-commits":
		q := dto.CoverageCommitsQueryDto{Provider: provider, RepoID: repoID, SHAs: subjectID}
		// CoverageCommitsQueryDto 没有 filePath 字段用于摘要，简易处理：附带 filePath 通过 query 传递（服务会读取 query.FilePath 吗？有字段）
		q.FilePath = filePath
		result, err := h.coverageService.GetCoverageSummaryMapForMultipleCommits(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject"})
		return
	}
}

// GetCoverageMapBySubject 统一入口：根据 subject/subjectID 获取覆盖率映射（详细）
func (h *CoverageHandler) GetCoverageMapBySubject(c *gin.Context) {
	subject := c.Query("subject")
	subjectID := c.Query("subjectID")
	provider := c.Query("provider")
	repoID := c.Query("repoID")
	filePath := c.Query("filePath")
	buildProvider := c.Query("buildProvider")
	buildID := c.Query("buildID")
	reportProvider := c.Query("reportProvider")
	reportID := c.Query("reportID")
	blockMerge := c.Query("blockMerge") == "true" // 是否启用代码块级（函数级）合并，默认为 false
	if provider == "" || repoID == "" || subject == "" || subjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider, repoID, subject, subjectID are required"})
		return
	}

	switch subject {
	case "commit", "commits":
		q := dto.CoverageQueryDto{Provider: provider, RepoID: repoID, SHA: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID}
		result, err := h.coverageService.GetCoverageMap(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "pull", "pulls":
		q := dto.CoveragePullMapQueryDto{Provider: provider, RepoID: repoID, PullNumber: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID, BlockMerge: blockMerge}
		result, err := h.coverageService.GetCoverageMapForPull(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	case "multiple-commits", "multi-commits":
		q := dto.CoverageCommitsQueryDto{Provider: provider, RepoID: repoID, SHAs: subjectID}
		q.FilePath = filePath
		result, err := h.coverageService.GetCoverageMapForMultipleCommits(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject"})
		return
	}
}

// GetCoverageMapForMultipleCommits 获取多commits的覆盖率映射（详细）
func (h *CoverageHandler) GetCoverageMapForMultipleCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider, repoID, and shas are required"})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	result, err := h.coverageService.GetCoverageMapForMultipleCommits(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

// GetCoverageSummaryMapForMultipleCommits 获取多commits的覆盖率摘要映射
func (h *CoverageHandler) GetCoverageSummaryMapForMultipleCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "provider, repoID, and shas are required"})
		return
	}

	if query.RequestID == "" {
		query.RequestID = utils.GenerateRequestID()
	}
	c.Header("X-Request-ID", query.RequestID)

	result, err := h.coverageService.GetCoverageSummaryMapForMultipleCommits(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
