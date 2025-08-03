package handlers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CoverageFinalHandler struct {
	coverageFinalService *services.CoverageFinalService
}

func NewCoverageFinalHandler(coverageFinalService *services.CoverageFinalService) *CoverageFinalHandler {
	return &CoverageFinalHandler{
		coverageFinalService: coverageFinalService,
	}
}

// GetCoverageSummaryMap handles GET /api/v1/coverage/summary/map
func (h *CoverageFinalHandler) GetCoverageSummaryMap(c *gin.Context) {
	var params services.CoverageQueryParams
	
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"message": err.Error(),
		})
		return
	}

	summaryMap, err := h.coverageFinalService.GetCoverageSummaryMap(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage summary map",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, summaryMap)
}

// GetCoverageMap handles GET /api/v1/coverage/map
func (h *CoverageFinalHandler) GetCoverageMap(c *gin.Context) {
	var params services.CoverageQueryParams
	
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"message": err.Error(),
		})
		return
	}

	coverageMap, err := h.coverageFinalService.GetCoverageMap(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage map",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, coverageMap)
}