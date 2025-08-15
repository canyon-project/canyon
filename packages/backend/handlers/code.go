package handlers

import (
	"backend/services"
	"backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CodeHandler 代码处理器
type CodeHandler struct {
	gitlabService *services.GitLabService
	vcs           services.VCS
}

// NewCodeHandler 创建代码处理器
func NewCodeHandler(gitlabService *services.GitLabService) *CodeHandler {
	return &CodeHandler{
		gitlabService: gitlabService,
		vcs:           services.VCSFor("gitlab"), // 默认 GitLab，兼容旧行为
	}
}

// GetFileContent 获取指定提交下的文件内容（Base64）
func (h *CodeHandler) GetFileContent(c *gin.Context) {
	repoIDStr := c.Query("repoID")
	sha := c.Query("sha")
	pullNumberStr := c.Query("pullNumber")
	filepath := c.Query("filepath")
	provider := c.DefaultQuery("provider", "gitlab")

	if repoIDStr == "" || filepath == "" {
		utils.Response.BadRequest(c, "repoID, filepath 为必填参数")
		return
	}

	if sha == "" && pullNumberStr == "" {
		utils.Response.BadRequest(c, "sha 与 pullNumber 至少提供一个")
		return
	}

	// 如果未提供sha但提供了pullNumber，仅 GitLab 支持从 PR 解析 head sha
	if sha == "" && pullNumberStr != "" {
		pullID, err := strconv.Atoi(pullNumberStr)
		if err != nil {
			utils.Response.BadRequest(c, "pullNumber 必须是数字")
			return
		}
		repoID, err := strconv.Atoi(repoIDStr)
		if err != nil {
			utils.Response.BadRequest(c, "repoID 必须是数字以解析 pullNumber")
			return
		}
		pr, err := h.gitlabService.GetPullRequest(repoID, pullID)
		if err != nil {
			utils.Response.InternalServerError(c, err)
			return
		}
		if pr != nil && pr.DiffRefs.HeadSha != "" {
			sha = pr.DiffRefs.HeadSha
		} else if pr != nil && len(pr.Commits) > 0 {
			sha = pr.Commits[len(pr.Commits)-1].ID
		} else {
			utils.Response.BadRequest(c, "无法从Pull Request解析head sha")
			return
		}
	}

	content, err := services.VCSFor(provider).GetFileContentBase64(repoIDStr, sha, filepath)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, gin.H{"content": content})
}

// GetPullRequest 获取Pull Request信息
func (h *CodeHandler) GetPullRequest(c *gin.Context) {
	// 获取路径参数
	projectIDStr := c.Param("projectID")
	pullRequestIDStr := c.Param("pullRequestID")

	// 转换参数类型
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		utils.Response.BadRequest(c, "项目ID必须是数字")
		return
	}

	pullRequestID, err := strconv.Atoi(pullRequestIDStr)
	if err != nil {
		utils.Response.BadRequest(c, "Pull Request ID必须是数字")
		return
	}

	// 获取Pull Request信息，包含差异
	result, err := h.gitlabService.GetPullRequestWithDiffs(projectID, pullRequestID)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetPullRequestChanges 获取Pull Request变更信息
func (h *CodeHandler) GetPullRequestChanges(c *gin.Context) {
	// 获取路径参数
	projectIDStr := c.Param("projectID")
	pullRequestIDStr := c.Param("pullRequestID")

	// 转换参数类型
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		utils.Response.BadRequest(c, "项目ID必须是数字")
		return
	}

	pullRequestID, err := strconv.Atoi(pullRequestIDStr)
	if err != nil {
		utils.Response.BadRequest(c, "Pull Request ID必须是数字")
		return
	}

	// 获取Pull Request变更信息
	changes, err := h.gitlabService.GetPullRequestChanges(projectID, pullRequestID)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, changes)
}

// GetProjectByPath 根据路径获取项目信息
func (h *CodeHandler) GetProjectByPath(c *gin.Context) {
	path := c.Param("path")
	if path == "" {
		utils.Response.BadRequest(c, "项目路径不能为空")
		return
	}

	// 获取项目信息（默认 GitLab）
	project, err := h.gitlabService.GetProjectByPath(path)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, project)
}
