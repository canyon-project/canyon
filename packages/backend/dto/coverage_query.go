package dto

// CoverageQueryDto 覆盖率查询参数
type CoverageQueryDto struct {
	Provider       string `form:"provider" json:"provider"`
	RepoID         string `form:"repoID" json:"repoID"`
	SHA            string `form:"sha" json:"sha"`
	BuildProvider  string `form:"buildProvider" json:"buildProvider"`
	BuildID        string `form:"buildID" json:"buildID"`
	ReportProvider string `form:"reportProvider" json:"reportProvider"`
	ReportID       string `form:"reportID" json:"reportID"`
	FilePath       string `form:"filePath" json:"filePath"`
}

// CoverageSummaryQueryDto 覆盖率摘要查询参数 - 新的路由参数结构
type CoverageSummaryQueryDto struct {
	Provider       string `form:"provider" json:"provider"`
	RepoID         string `form:"repoID" json:"repoID"`
	SHA            string `form:"sha" json:"sha"`
	BuildProvider  string `form:"buildProvider" json:"buildProvider"`
	BuildID        string `form:"buildID" json:"buildID"`
	ReportProvider string `form:"reportProvider" json:"reportProvider"`
	ReportID       string `form:"reportID" json:"reportID"`
	FilePath       string `form:"filePath" json:"filePath"`
}

// RepoQueryDto 仓库查询参数
type RepoQueryDto struct {
	Keyword string `form:"keyword" json:"keyword"`
}