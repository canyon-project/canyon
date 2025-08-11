package handlers

import (
	"backend/dto"
	"backend/services"
	"encoding/base64"
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

	// 尝试Base64解码，如果失败则使用原始字符串
	var decodedRepoID string
	decodedBytes, err := base64.StdEncoding.DecodeString(repoID)
	if err != nil {
		// 如果不是base64编码，直接使用原始字符串
		decodedRepoID = repoID
	} else {
		decodedRepoID = string(decodedBytes)
	}

	result, err := h.repoService.GetByRepoId(decodedRepoID)
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

	// 尝试Base64解码，如果失败则使用原始字符串
	var decodedRepoID string
	decodedBytes, err := base64.StdEncoding.DecodeString(repoID)
	if err != nil {
		// 如果不是base64编码，直接使用原始字符串
		decodedRepoID = repoID
	} else {
		decodedRepoID = string(decodedBytes)
	}

	result, err := h.repoService.GetCommitsByRepoId(decodedRepoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetRepoPulls 获取仓库的Pull Requests（基于覆盖率关联的commits）
func (h *RepoHandler) GetRepoPulls(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID is required"})
		return
	}

	// 支持Base64路径
	var decodedRepoID string
	if decodedBytes, err := base64.StdEncoding.DecodeString(repoID); err == nil {
		decodedRepoID = string(decodedBytes)
	} else {
		decodedRepoID = repoID
	}

	result, err := h.repoService.GetPullsByRepoId(decodedRepoID)
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

	// 尝试Base64解码，如果失败则使用原始字符串
	var decodedRepoID string
	decodedBytes, err := base64.StdEncoding.DecodeString(repoID)
	if err != nil {
		// 如果不是base64编码，直接使用原始字符串
		decodedRepoID = repoID
	} else {
		decodedRepoID = string(decodedBytes)
	}

	result, err := h.repoService.GetCommitBySHA(decodedRepoID, sha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
