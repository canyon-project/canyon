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

// GetCoverageOverviewBySubject 统一入口：根据 subject/subjectID 获取覆盖率概览
func (h *CoverageHandler) GetCoverageOverviewBySubject(c *gin.Context) {
	subject := c.Query("subject")     // commit | pull | multiple-commits
	subjectID := c.Query("subjectID") // sha | pullNumber | sha1,sha2,sha3
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
		// 兼容前端期望：直接返回 resultList 数组
		if resultMap, ok := result.(map[string]interface{}); ok {
			if list, exists := resultMap["resultList"]; exists {
				utils.Response.Success(c, list)
				return
			}
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
	default:
		utils.Response.BadRequest(c, "invalid subject")
		return
	}
}
