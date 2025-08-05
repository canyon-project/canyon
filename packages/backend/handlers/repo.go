package handlers

import (
	"backend/dto"
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RepoHandler 仓库处理器
type RepoHandler struct {
	repoService *services.RepoService
}

// NewRepoHandler 创建仓库处理器
func NewRepoHandler(repoService *services.RepoService) *RepoHandler {
	return &RepoHandler{
		repoService: repoService,
	}
}

// GetRepos 获取仓库列表
func (h *RepoHandler) GetRepos(c *gin.Context) {
	var query dto.RepoQueryDto
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.repoService.GetRepoList(query.Keyword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetRepoByID 根据仓库ID获取仓库信息
func (h *RepoHandler) GetRepoByID(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID is required"})
		return
	}

	result, err := h.repoService.GetByRepoId(repoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetRepoCommits 获取仓库提交记录
func (h *RepoHandler) GetRepoCommits(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID is required"})
		return
	}

	result, err := h.repoService.GetCommitsByRepoId(repoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetRepoCommitBySHA 根据提交SHA获取提交详情
func (h *RepoHandler) GetRepoCommitBySHA(c *gin.Context) {
	repoID := c.Param("repoID")
	sha := c.Param("sha")

	if repoID == "" || sha == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID and sha are required"})
		return
	}

	result, err := h.repoService.GetCommitBySHA(repoID, sha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}