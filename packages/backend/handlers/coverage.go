package handlers

import (
	"backend/dto"
	"backend/services"
	"backend/utils"

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
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		utils.Response.BadRequest(c, "provider, repoID, and sha are required")
		return
	}

	// 调用新的服务方法获取覆盖率摘要
	result, err := h.coverageService.GetCoverageSummaryByRepoAndSHA(query.RepoID, query.SHA)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetCoverageSummaryMap 获取覆盖率摘要映射
func (h *CoverageHandler) GetCoverageSummaryMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	// 调用服务直接在数据库计算摘要（深度优化版本）
	summaryMap, err := h.coverageService.GetCoverageSummaryMapFast(query)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, summaryMap)
}

// GetCoverageMap 获取覆盖率映射
func (h *CoverageHandler) GetCoverageMap(c *gin.Context) {
	var query dto.CoverageQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHA == "" {
		utils.Response.BadRequest(c, "provider, repoID, and sha are required")
		return
	}

	// 调用服务获取覆盖率映射数据
	result, err := h.coverageService.GetCoverageMap(query)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetCoverageSummaryForPull 获取一个pull request的覆盖率概览
func (h *CoverageHandler) GetCoverageSummaryForPull(c *gin.Context) {
	var query dto.CoveragePullQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.PullNumber == "" {
		utils.Response.BadRequest(c, "provider, repoID, and pullNumber are required")
		return
	}

	// 获取PR覆盖率概览（合并所有构建，不区分buildID/buildProvider）
	result, err := h.coverageService.GetCoverageSummaryForPull(query)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetCoverageSummaryForCommits 获取多个commits的覆盖率概览
func (h *CoverageHandler) GetCoverageSummaryForCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	// 验证必需参数
	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		utils.Response.BadRequest(c, "provider, repoID, and shas are required")
		return
	}

	// TODO: 实现获取多个commits覆盖率概览的逻辑
	utils.Response.SuccessWithMessage(c, gin.H{
		"status": "not_implemented",
		"params": query,
	}, "TODO: 实现获取多个commits覆盖率概览的功能")
}

// GetCoverageOverviewBySubject 统一入口：根据 subject/subjectID 获取覆盖率概览
func (h *CoverageHandler) GetCoverageOverviewBySubject(c *gin.Context) {
	subject := c.Query("subject")     // commit | pull | multiple-commits
	subjectID := c.Query("subjectID") // sha | pullNumber | shas (comma)
	provider := c.Query("provider")
	repoID := c.Query("repoID")
	
	if provider == "" || repoID == "" || subject == "" || subjectID == "" {
		utils.Response.BadRequest(c, "provider, repoID, subject, subjectID are required")
		return
	}

	switch subject {
	case "commit", "commits":
		result, err := h.coverageService.GetCoverageSummaryByRepoAndSHA(repoID, subjectID)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "pull", "pulls":
		// 复用现有 PR 概览
		var q dto.CoveragePullQueryDto
		q.Provider = provider
		q.RepoID = repoID
		q.PullNumber = subjectID
		result, err := h.coverageService.GetCoverageSummaryForPull(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "multiple-commits", "multi-commits":
		utils.Response.BadRequest(c, "overview for multiple-commits is not supported yet")
		return
	default:
		utils.Response.BadRequest(c, "invalid subject")
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
		utils.Response.BadRequest(c, "provider, repoID, subject, subjectID are required")
		return
	}

	switch subject {
	case "commit", "commits":
		q := dto.CoverageQueryDto{Provider: provider, RepoID: repoID, SHA: subjectID, FilePath: filePath}
		result, err := h.coverageService.GetCoverageSummaryMapFast(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "pull", "pulls":
		q := dto.CoveragePullMapQueryDto{Provider: provider, RepoID: repoID, PullNumber: subjectID, FilePath: filePath}
		result, err := h.coverageService.GetCoverageSummaryMapForPull(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "multiple-commits", "multi-commits":
		q := dto.CoverageCommitsQueryDto{Provider: provider, RepoID: repoID, SHAs: subjectID}
		q.FilePath = filePath
		result, err := h.coverageService.GetCoverageSummaryMapForMultipleCommits(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	default:
		utils.Response.BadRequest(c, "invalid subject")
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
		utils.Response.BadRequest(c, "provider, repoID, subject, subjectID are required")
		return
	}

	switch subject {
	case "commit", "commits":
		q := dto.CoverageQueryDto{Provider: provider, RepoID: repoID, SHA: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID}
		result, err := h.coverageService.GetCoverageMap(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "pull", "pulls":
		q := dto.CoveragePullMapQueryDto{Provider: provider, RepoID: repoID, PullNumber: subjectID, FilePath: filePath, BuildProvider: buildProvider, BuildID: buildID, ReportProvider: reportProvider, ReportID: reportID, BlockMerge: blockMerge}
		result, err := h.coverageService.GetCoverageMapForPull(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	case "multiple-commits", "multi-commits":
		q := dto.CoverageCommitsQueryDto{Provider: provider, RepoID: repoID, SHAs: subjectID}
		q.FilePath = filePath
		result, err := h.coverageService.GetCoverageMapForMultipleCommits(q)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		utils.Response.Success(c, result)
		return
	default:
		utils.Response.BadRequest(c, "invalid subject")
		return
	}
}

// GetCoverageMapForMultipleCommits 获取多commits的覆盖率映射（详细）
func (h *CoverageHandler) GetCoverageMapForMultipleCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		utils.Response.BadRequest(c, "provider, repoID, and shas are required")
		return
	}

	result, err := h.coverageService.GetCoverageMapForMultipleCommits(query)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}
	
	utils.Response.Success(c, result)
}

// GetCoverageSummaryMapForMultipleCommits 获取多commits的覆盖率摘要映射
func (h *CoverageHandler) GetCoverageSummaryMapForMultipleCommits(c *gin.Context) {
	var query dto.CoverageCommitsQueryDto
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	if query.Provider == "" || query.RepoID == "" || query.SHAs == "" {
		utils.Response.BadRequest(c, "provider, repoID, and shas are required")
		return
	}

	result, err := h.coverageService.GetCoverageSummaryMapForMultipleCommits(query)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}
	
	utils.Response.Success(c, result)
}
