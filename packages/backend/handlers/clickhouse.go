package handlers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ClickHouseHandler ClickHouse处理器
type ClickHouseHandler struct {
	clickhouseService *services.ClickHouseService
}

// NewClickHouseHandler 创建ClickHouse处理器
func NewClickHouseHandler(clickhouseService *services.ClickHouseService) *ClickHouseHandler {
	return &ClickHouseHandler{
		clickhouseService: clickhouseService,
	}
}

// GetCoverageHitAgg 获取覆盖率聚合数据
func (h *ClickHouseHandler) GetCoverageHitAgg(c *gin.Context) {
	coverageID := c.Param("id")
	if coverageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "coverage_id is required"})
		return
	}

	result, err := h.clickhouseService.GetCoverageHitAgg(coverageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"coverage_id": coverageID,
		"data":        result,
		"total":       len(result),
	})
}

// GetCoverageMap 获取覆盖率映射数据
func (h *ClickHouseHandler) GetCoverageMap(c *gin.Context) {
	hash := c.Param("hash")
	if hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "hash is required"})
		return
	}

	result, err := h.clickhouseService.GetCoverageMap(hash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 返回详细的统计信息
	response := gin.H{
		"hash": result.Hash,
		"ts":   result.Ts,
		"statistics": gin.H{
			"statement_map_count":         len(result.StatementMap),
			"fn_map_count":               len(result.FnMap),
			"branch_map_count":           len(result.BranchMap),
			"restore_statement_map_count": len(result.RestoreStatementMap),
			"restore_fn_map_count":       len(result.RestoreFnMap),
			"restore_branch_map_count":   len(result.RestoreBranchMap),
		},
		"data": result,
	}

	c.JSON(http.StatusOK, response)
}

// GetCoverageHitAggBySHA 根据SHA获取覆盖率聚合数据
func (h *ClickHouseHandler) GetCoverageHitAggBySHA(c *gin.Context) {
	repoID := c.Param("repoID")
	sha := c.Param("sha")

	if repoID == "" || sha == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID and sha are required"})
		return
	}

	result, err := h.clickhouseService.GetCoverageHitAggBySHA(repoID, sha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"repo_id": repoID,
		"sha":     sha,
		"data":    result,
		"total":   len(result),
	})
}

// TestClickHouseConnection 测试ClickHouse连接
func (h *ClickHouseHandler) TestClickHouseConnection(c *gin.Context) {
	err := h.clickhouseService.TestConnection()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "ClickHouse连接正常",
	})
}

// TestRawQuery 测试原始查询
func (h *ClickHouseHandler) TestRawQuery(c *gin.Context) {
	coverageID := c.Param("id")
	if coverageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "coverage_id is required"})
		return
	}

	result, err := h.clickhouseService.TestRawQuery(coverageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}