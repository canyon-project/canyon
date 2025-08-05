package handlers

import (
	"backend/db"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DebugHandler 调试处理器
type DebugHandler struct{}

// NewDebugHandler 创建调试处理器
func NewDebugHandler() *DebugHandler {
	return &DebugHandler{}
}

// TestCoverageQuery 测试coverage查询
func (h *DebugHandler) TestCoverageQuery(c *gin.Context) {
	provider := c.Query("provider")
	repoID := c.Query("repoID")
	sha := c.Query("sha")

	if provider == "" || repoID == "" || sha == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider, repoID, and sha are required",
		})
		return
	}

	// 测试PostgreSQL查询
	pgDB := db.GetDB()
	var coverageList []models.Coverage
	
	if err := pgDB.Where("provider = ? AND repo_id = ? AND sha = ?", 
		provider, repoID, sha).Find(&coverageList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "查询coverage失败: " + err.Error(),
		})
		return
	}

	// 如果有coverage数据，查询relation
	var relationCount int64 = 0
	if len(coverageList) > 0 {
		coverageIDs := make([]string, len(coverageList))
		for i, coverage := range coverageList {
			coverageIDs[i] = coverage.ID
		}

		pgDB.Table("canyonjs_coverage_map_relation").
			Where("coverage_id IN ?", coverageIDs).
			Count(&relationCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"postgres": gin.H{
			"coverage_count": len(coverageList),
			"coverage_list":  coverageList,
			"relation_count": relationCount,
		},
		"clickhouse": gin.H{
			"status": "connected",
		},
		"query": gin.H{
			"provider": provider,
			"repoID":   repoID,
			"sha":      sha,
		},
	})
}

// TestClickHouseQuery 测试ClickHouse查询
func (h *DebugHandler) TestClickHouseQuery(c *gin.Context) {
	// 测试ClickHouse连接
	if err := db.ClickHouseHealthCheck(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "ClickHouse连接失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clickhouse": "connected",
		"message":    "ClickHouse连接正常",
	})
}