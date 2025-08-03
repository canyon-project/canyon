package handlers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RepoHandler struct {
	repoService *services.RepoService
}

func NewRepoHandler(repoService *services.RepoService) *RepoHandler {
	return &RepoHandler{
		repoService: repoService,
	}
}

// GetRepos handles GET /api/v1/repo
func (h *RepoHandler) GetRepos(c *gin.Context) {
	keyword := c.Query("keyword")
	
	repos, err := h.repoService.GetRepoList(keyword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get repositories",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, repos)
}

// GetRepoByID handles GET /api/v1/repo/:repoID
func (h *RepoHandler) GetRepoByID(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Repository ID is required",
		})
		return
	}

	repo, err := h.repoService.GetByRepoID(repoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get repository",
			"message": err.Error(),
		})
		return
	}

	if repo == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Repository not found",
		})
		return
	}

	c.JSON(http.StatusOK, repo)
}

// GetRepoCommits handles GET /api/v1/repo/:repoID/commits
func (h *RepoHandler) GetRepoCommits(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Repository ID is required",
		})
		return
	}

	commits, err := h.repoService.GetRepoCommitsByRepoID(repoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get repository commits",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, commits)
}

// GetRepoCommitByCommitSHA handles GET /api/v1/repo/:repoID/commits/:sha
func (h *RepoHandler) GetRepoCommitByCommitSHA(c *gin.Context) {
	repoID := c.Param("repoID")
	sha := c.Param("sha")
	
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Repository ID is required",
		})
		return
	}
	
	if sha == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Commit SHA is required",
		})
		return
	}

	commitDetails, err := h.repoService.GetRepoCommitByCommitSHA(repoID, sha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get commit details",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, commitDetails)
}