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

// GetFileContent 获取指定提交下的文件内容（Base64）
// @Summary 获取指定提交下的文件内容
// @Description 根据仓库ID、提交SHA与文件路径获取该文件在该提交下的内容（Base64 编码）
// @Tags code
// @Accept json
// @Produce json
// @Param repoID query int true "仓库ID"
// @Param sha query string false "提交SHA（与pullNumber二选一）"
// @Param pullNumber query int false "Pull Request ID（与sha二选一）"
// @Param filepath query string true "文件路径（URL 编码或普通路径均可）"
// @Success 200 {object} map[string]interface{} "文件内容（content 字段为 Base64 编码）"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /code [get]
func (h *CodeHandler) GetFileContent(c *gin.Context) {
	repoIDStr := c.Query("repoID")
	sha := c.Query("sha")
	pullNumberStr := c.Query("pullNumber")
	filepath := c.Query("filepath")

	if repoIDStr == "" || filepath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID, filepath 为必填参数"})
		return
	}

	if sha == "" && pullNumberStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sha 与 pullNumber 至少提供一个"})
		return
	}

	repoID, err := strconv.Atoi(repoIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repoID 必须是数字"})
		return
	}

	// 如果未提供sha但提供了pullNumber，则从PR解析head sha
	if sha == "" && pullNumberStr != "" {
		pullID, err := strconv.Atoi(pullNumberStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "pullNumber 必须是数字"})
			return
		}
		pr, err := h.gitlabService.GetPullRequest(repoID, pullID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if pr != nil && pr.DiffRefs.HeadSha != "" {
			sha = pr.DiffRefs.HeadSha
		} else if pr != nil && len(pr.Commits) > 0 {
			sha = pr.Commits[len(pr.Commits)-1].ID
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无法从Pull Request解析head sha"})
			return
		}
	}

	content, err := h.gitlabService.GetFileContentBase64(repoID, sha, filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"content": content})
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
