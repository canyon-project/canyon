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
// @Summary 获取仓库列表
// @Description 根据关键词搜索仓库列表
// @Tags repository
// @Accept json
// @Produce json
// @Param keyword query string false "搜索关键词" example(react)
// @Success 200 {object} map[string]interface{} "仓库列表"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /repo [get]
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
// @Summary 根据仓库ID获取仓库信息
// @Description 根据仓库ID获取详细的仓库信息
// @Tags repository
// @Accept json
// @Produce json
// @Param repoID path string true "仓库ID" example(owner/repo)
// @Success 200 {object} map[string]interface{} "仓库详细信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /repo/{repoID} [get]
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
// @Summary 获取仓库提交记录
// @Description 获取指定仓库的提交记录列表
// @Tags repository
// @Accept json
// @Produce json
// @Param repoID path string true "仓库ID" example(owner/repo)
// @Success 200 {object} map[string]interface{} "提交记录列表"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /repo/{repoID}/commits [get]
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

// GetRepoCommitBySHA 根据提交SHA获取提交详情
// @Summary 根据提交SHA获取提交详情
// @Description 根据仓库ID和提交SHA获取详细的提交信息
// @Tags repository
// @Accept json
// @Produce json
// @Param repoID path string true "仓库ID" example(owner/repo)
// @Param sha path string true "提交SHA" example(abc123def456)
// @Success 200 {object} map[string]interface{} "提交详细信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /repo/{repoID}/commits/{sha} [get]
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