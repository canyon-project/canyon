package handlers

import (
	"backend/dto"
	"backend/services"
	"backend/utils"

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
	if err := utils.Binding.BindAndValidate(c, &query); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	result, err := h.repoService.GetRepoList(query.Keyword)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetRepoByID 根据仓库ID获取仓库信息
func (h *RepoHandler) GetRepoByID(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		utils.Response.BadRequest(c, "repoID is required")
		return
	}

	// 尝试Base64解码，如果失败则使用原始字符串
	decodedRepoID := utils.Decoder.DecodeBase64OrUseOriginal(repoID)

	result, err := h.repoService.GetByRepoId(decodedRepoID)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetRepoCommits 获取仓库提交记录
func (h *RepoHandler) GetRepoCommits(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		utils.Response.BadRequest(c, "repoID is required")
		return
	}

	// 尝试Base64解码，如果失败则使用原始字符串
	decodedRepoID := utils.Decoder.DecodeBase64OrUseOriginal(repoID)

	result, err := h.repoService.GetCommitsByRepoId(decodedRepoID)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetRepoPulls 获取仓库的Pull Requests（基于覆盖率关联的commits）
func (h *RepoHandler) GetRepoPulls(c *gin.Context) {
	repoID := c.Param("repoID")
	if repoID == "" {
		utils.Response.BadRequest(c, "repoID is required")
		return
	}

	// 支持Base64路径
	decodedRepoID := utils.Decoder.DecodeBase64OrUseOriginal(repoID)

	result, err := h.repoService.GetPullsByRepoId(decodedRepoID)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}

// GetRepoCommitBySHA 根据提交SHA获取提交详情
func (h *RepoHandler) GetRepoCommitBySHA(c *gin.Context) {
	repoID := c.Param("repoID")
	sha := c.Param("sha")

	if repoID == "" || sha == "" {
		utils.Response.BadRequest(c, "repoID and sha are required")
		return
	}

	// 尝试Base64解码，如果失败则使用原始字符串
	decodedRepoID := utils.Decoder.DecodeBase64OrUseOriginal(repoID)

	result, err := h.repoService.GetCommitBySHA(decodedRepoID, sha)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, result)
}
