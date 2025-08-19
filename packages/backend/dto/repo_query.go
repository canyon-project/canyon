package dto

// RepoIdentifyDto 仓库标识请求体
// 支持字符串或数字ID；如果是带斜杠的字符串（如 owner/repo），将按 path_with_namespace 查询
type RepoIdentifyDto struct {
	ID interface{} `json:"id" binding:"required"`
}
