package dto

// CoverageQueryDto 覆盖率查询参数
// @Description 覆盖率查询参数结构体
type CoverageQueryDto struct {
	// @Description 提供商名称
	Provider string `form:"provider" json:"provider" example:"github"`
	// @Description 仓库ID
	RepoID string `form:"repoID" json:"repoID" example:"owner/repo"`
	// @Description 提交SHA
	SHA string `form:"sha" json:"sha" example:"abc123def456"`
	// @Description 构建提供商
	BuildProvider string `form:"buildProvider" json:"buildProvider" example:"jenkins"`
	// @Description 构建ID
	BuildID string `form:"buildID" json:"buildID" example:"build-123"`
	// @Description 报告提供商
	ReportProvider string `form:"reportProvider" json:"reportProvider" example:"jest"`
	// @Description 报告ID
	ReportID string `form:"reportID" json:"reportID" example:"report-456"`
	// @Description 文件路径
	FilePath string `form:"filePath" json:"filePath" example:"src/main.go"`
}

// CoverageSummaryQueryDto 覆盖率摘要查询参数 - 新的路由参数结构
// @Description 覆盖率摘要查询参数结构体
type CoverageSummaryQueryDto struct {
	// @Description 提供商名称
	Provider string `form:"provider" json:"provider" example:"github"`
	// @Description 仓库ID
	RepoID string `form:"repoID" json:"repoID" example:"owner/repo"`
	// @Description 提交SHA
	SHA string `form:"sha" json:"sha" example:"abc123def456"`
	// @Description 构建提供商
	BuildProvider string `form:"buildProvider" json:"buildProvider" example:"jenkins"`
	// @Description 构建ID
	BuildID string `form:"buildID" json:"buildID" example:"build-123"`
	// @Description 报告提供商
	ReportProvider string `form:"reportProvider" json:"reportProvider" example:"jest"`
	// @Description 报告ID
	ReportID string `form:"reportID" json:"reportID" example:"report-456"`
	// @Description 文件路径
	FilePath string `form:"filePath" json:"filePath" example:"src/main.go"`
}

// RepoQueryDto 仓库查询参数
// @Description 仓库查询参数结构体
type RepoQueryDto struct {
	// @Description 搜索关键词
	Keyword string `form:"keyword" json:"keyword" example:"react"`
}