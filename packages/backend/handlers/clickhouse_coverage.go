package handlers

import (
	"backend/models"
	"backend/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ClickHouseCoverageHandler struct {
	clickhouseService *services.ClickHouseService
}

func NewClickHouseCoverageHandler() *ClickHouseCoverageHandler {
	return &ClickHouseCoverageHandler{
		clickhouseService: services.NewClickHouseService(),
	}
}

// PostCoverageHit handles POST /api/v1/clickhouse/coverage/hit
func (h *ClickHouseCoverageHandler) PostCoverageHit(c *gin.Context) {
	var hit models.CoverageHit
	if err := c.ShouldBindJSON(&hit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Set timestamp if not provided
	if hit.Ts.IsZero() {
		hit.Ts = time.Now()
	}

	if err := h.clickhouseService.InsertCoverageHit(&hit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to insert coverage hit",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Coverage hit inserted successfully",
	})
}

// PostCoverageHitsBatch handles POST /api/v1/clickhouse/coverage/hits/batch
func (h *ClickHouseCoverageHandler) PostCoverageHitsBatch(c *gin.Context) {
	var hits []models.CoverageHit
	if err := c.ShouldBindJSON(&hits); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Set timestamps if not provided
	now := time.Now()
	for i := range hits {
		if hits[i].Ts.IsZero() {
			hits[i].Ts = now
		}
	}

	if err := h.clickhouseService.BatchInsertCoverageHits(hits); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to insert coverage hits batch",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Coverage hits batch inserted successfully",
		"count":   len(hits),
	})
}

// PostCoverageMap handles POST /api/v1/clickhouse/coverage/map
func (h *ClickHouseCoverageHandler) PostCoverageMap(c *gin.Context) {
	var coverageMap models.CoverageMap
	if err := c.ShouldBindJSON(&coverageMap); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Set timestamp if not provided
	if coverageMap.Ts.IsZero() {
		coverageMap.Ts = time.Now()
	}

	if err := h.clickhouseService.InsertCoverageMap(&coverageMap); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to insert coverage map",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Coverage map inserted successfully",
	})
}

// GetCoverageMap handles GET /api/v1/clickhouse/coverage/map/:hash
func (h *ClickHouseCoverageHandler) GetCoverageMap(c *gin.Context) {
	hash := c.Param("hash")
	if hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Hash parameter is required",
		})
		return
	}

	coverageMap, err := h.clickhouseService.GetCoverageMap(hash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage map",
			"message": err.Error(),
		})
		return
	}

	if coverageMap == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Coverage map not found",
		})
		return
	}

	c.JSON(http.StatusOK, coverageMap)
}

// GetCoverageAggregation handles GET /api/v1/clickhouse/coverage/:coverage_id/aggregation
func (h *ClickHouseCoverageHandler) GetCoverageAggregation(c *gin.Context) {
	coverageID := c.Param("coverage_id")
	if coverageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Coverage ID parameter is required",
		})
		return
	}

	results, err := h.clickhouseService.GetCoverageAggregation(coverageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage aggregation",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": results,
	})
}

// GetCoverageHits handles GET /api/v1/clickhouse/coverage/:coverage_id/hits
func (h *ClickHouseCoverageHandler) GetCoverageHits(c *gin.Context) {
	coverageID := c.Param("coverage_id")
	if coverageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Coverage ID parameter is required",
		})
		return
	}

	// Parse optional time range parameters
	var startTime, endTime time.Time
	var err error

	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		startTime, err = time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid start_time format",
				"message": "Use RFC3339 format (e.g., 2023-01-01T00:00:00Z)",
			})
			return
		}
	} else {
		// Default to 24 hours ago
		startTime = time.Now().Add(-24 * time.Hour)
	}

	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		endTime, err = time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid end_time format",
				"message": "Use RFC3339 format (e.g., 2023-01-01T00:00:00Z)",
			})
			return
		}
	} else {
		// Default to now
		endTime = time.Now()
	}

	hits, err := h.clickhouseService.GetCoverageHitsByTimeRange(coverageID, startTime, endTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage hits",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       hits,
		"start_time": startTime,
		"end_time":   endTime,
		"count":      len(hits),
	})
}