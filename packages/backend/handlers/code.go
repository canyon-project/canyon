package handlers

import (
	"backend/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CodeHandler 代码处理器
type CodeHandler struct {
	gitlabService *services.GitLabService
}

// NewCodeHandler 创建代码处理器
func NewCodeHandler(gitlabService *services.GitLabService) *CodeHandler {
	return &CodeHandler{
		gitlabService: gitlabService,
	}
}

// GetPullRequest 获取Pull Request信息
// @Summary 获取Pull Request信息
// @Description 根据项目ID和Pull Request ID获取详细信息，包括commits信息和最新commit与其他commits的差异文件列表
// @Tags code
// @Accept json
// @Produce json
// @Param projectID path int true "项目ID" example(123)
// @Param pullRequestID path int true "Pull Request ID" example(456)
// @Success 200 {object} map[string]interface{} "Pull Request信息，包含diffs字段显示差异文件列表"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /code/pulls/{projectID}/{pullRequestID} [get]
func (h *CodeHandler) GetPullRequest(c *gin.Context) {
	// 获取路径参数
	projectIDStr := c.Param("projectID")
	pullRequestIDStr := c.Param("pullRequestID")

	// 转换参数类型
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "项目ID必须是数字"})
		return
	}

	pullRequestID, err := strconv.Atoi(pullRequestIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pull Request ID必须是数字"})
		return
	}

	// 获取Pull Request信息，包含差异
	result, err := h.gitlabService.GetPullRequestWithDiffs(projectID, pullRequestID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetPullRequestChanges 获取Pull Request变更信息
// @Summary 获取Pull Request变更信息
// @Description 根据项目ID和Pull Request ID获取变更详情
// @Tags code
// @Accept json
// @Produce json
// @Param projectID path int true "项目ID" example(123)
// @Param pullRequestID path int true "Pull Request ID" example(456)
// @Success 200 {array} map[string]interface{} "变更信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /code/pulls/{projectID}/{pullRequestID}/changes [get]
func (h *CodeHandler) GetPullRequestChanges(c *gin.Context) {
	// 获取路径参数
	projectIDStr := c.Param("projectID")
	pullRequestIDStr := c.Param("pullRequestID")

	// 转换参数类型
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "项目ID必须是数字"})
		return
	}

	pullRequestID, err := strconv.Atoi(pullRequestIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pull Request ID必须是数字"})
		return
	}

	// 获取Pull Request变更信息
	changes, err := h.gitlabService.GetPullRequestChanges(projectID, pullRequestID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, changes)
}

// GetProjectByPath 根据路径获取项目信息
// @Summary 根据路径获取项目信息
// @Description 根据项目路径获取项目详细信息
// @Tags code
// @Accept json
// @Produce json
// @Param path path string true "项目路径" example(group/project)
// @Success 200 {object} map[string]interface{} "项目信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /code/projects/{path} [get]
func (h *CodeHandler) GetProjectByPath(c *gin.Context) {
	path := c.Param("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "项目路径不能为空"})
		return
	}

	// 获取项目信息
	project, err := h.gitlabService.GetProjectByPath(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, project)
}
