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
	// @Description 请求ID（可选，用于日志追踪）
	RequestID string `form:"requestID" json:"requestID" example:"req-123"`
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
	// @Description 请求ID（可选，用于日志追踪）
	RequestID string `form:"requestID" json:"requestID" example:"req-123"`
}

// RepoQueryDto 仓库查询参数
// @Description 仓库查询参数结构体
type RepoQueryDto struct {
	// @Description 搜索关键词
	Keyword string `form:"keyword" json:"keyword" example:"react"`
}

// CoveragePullQueryDto PR覆盖率查询参数
// @Description PR覆盖率查询参数结构体
type CoveragePullQueryDto struct {
	// @Description 提供商名称
	Provider string `form:"provider" json:"provider" example:"github"`
	// @Description 仓库ID
	RepoID string `form:"repoID" json:"repoID" example:"owner/repo"`
	// @Description PR号
	PullNumber string `form:"pullNumber" json:"pullNumber" example:"123"`
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
	// @Description 请求ID（可选，用于日志追踪）
	RequestID string `form:"requestID" json:"requestID" example:"req-123"`
}

// CoverageCommitsQueryDto 多个commits覆盖率查询参数
// @Description 多个commits覆盖率查询参数结构体
type CoverageCommitsQueryDto struct {
	// @Description 提供商名称
	Provider string `form:"provider" json:"provider" example:"github"`
	// @Description 仓库ID
	RepoID string `form:"repoID" json:"repoID" example:"owner/repo"`
	// @Description 提交SHA列表，用逗号分隔
	SHAs string `form:"shas" json:"shas" example:"abc123def456,def456ghi789"`
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
	// @Description 请求ID（可选，用于日志追踪）
	RequestID string `form:"requestID" json:"requestID" example:"req-123"`
	// @Description 是否启用代码块级（函数级）合并；默认false，仅文件级
	BlockMerge bool `form:"blockMerge" json:"blockMerge" example:"false"`
}

// CoveragePullMapQueryDto PR覆盖率映射查询参数
// @Description PR覆盖率映射查询参数结构体
type CoveragePullMapQueryDto struct {
	// @Description 提供商名称
	Provider string `form:"provider" json:"provider" example:"github"`
	// @Description 仓库ID
	RepoID string `form:"repoID" json:"repoID" example:"owner/repo"`
	// @Description PR号
	PullNumber string `form:"pullNumber" json:"pullNumber" example:"123"`
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
	// @Description 请求ID（可选，用于日志追踪）
	RequestID string `form:"requestID" json:"requestID" example:"req-123"`
	// @Description 是否启用代码块级（函数级）合并；默认false，仅文件级
	BlockMerge bool `form:"blockMerge" json:"blockMerge" example:"false"`
}
