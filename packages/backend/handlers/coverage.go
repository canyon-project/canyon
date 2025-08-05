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

// GetCoverageSummaryMap 获取覆盖率摘要映射
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

