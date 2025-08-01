package handlers

import (
	"backend3/models"
	"backend3/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CoverageHandler struct {
	coverageService *services.CoverageService
}

func NewCoverageHandler(coverageService *services.CoverageService) *CoverageHandler {
	return &CoverageHandler{
		coverageService: coverageService,
	}
}

// GetCoverageList handles GET /api/v1/coverage
func (h *CoverageHandler) GetCoverageList(c *gin.Context) {
	var req models.CoverageListRequest

	// Set default values
	req.Page = 1
	req.PageSize = models.DefaultPageSize

	// Parse query parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			req.Page = page
		}
	}

	if pageSizeStr := c.Query("pageSize"); pageSizeStr != "" {
		if pageSize, err := strconv.Atoi(pageSizeStr); err == nil && pageSize > 0 {
			if pageSize > models.MaxPageSize {
				pageSize = models.MaxPageSize
			}
			req.PageSize = pageSize
		}
	}

	// Parse filter parameters
	req.ProjectID = c.Query("projectId")
	req.Branch = c.Query("branch")
	req.Provider = c.Query("provider")
	req.CovType = c.Query("covType")

	// Get coverage list from service
	response, err := h.coverageService.GetCoverageList(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage list",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetCoverageByID handles GET /api/v1/coverage/:id
func (h *CoverageHandler) GetCoverageByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Coverage ID is required",
		})
		return
	}

	coverage, err := h.coverageService.GetCoverageByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get coverage",
			"message": err.Error(),
		})
		return
	}

	if coverage == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Coverage not found",
		})
		return
	}

	c.JSON(http.StatusOK, coverage)
}