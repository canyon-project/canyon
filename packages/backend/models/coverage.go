package models

import (
	"time"
)

// Coverage represents the coverage data structure
type Coverage struct {
	ID                     string    `json:"id" gorm:"primaryKey;column:id"`
	SHA                    string    `json:"sha" gorm:"column:sha"`
	Branch                 string    `json:"branch" gorm:"column:branch"`
	CompareTarget          string    `json:"compareTarget" gorm:"column:compare_target"`
	Provider               string    `json:"provider" gorm:"column:provider"`
	BuildProvider          string    `json:"buildProvider" gorm:"column:build_provider"`
	BuildID                string    `json:"buildId" gorm:"column:build_id"`
	ProjectID              string    `json:"projectId" gorm:"column:project_id"`
	Reporter               string    `json:"reporter" gorm:"column:reporter"`
	ReportID               string    `json:"reportId" gorm:"column:report_id"`
	CovType                string    `json:"covType" gorm:"column:cov_type"`
	BranchesTotal          int       `json:"branchesTotal" gorm:"column:branches_total"`
	BranchesCovered        int       `json:"branchesCovered" gorm:"column:branches_covered"`
	FunctionsTotal         int       `json:"functionsTotal" gorm:"column:functions_total"`
	FunctionsCovered       int       `json:"functionsCovered" gorm:"column:functions_covered"`
	LinesTotal             int       `json:"linesTotal" gorm:"column:lines_total"`
	LinesCovered           int       `json:"linesCovered" gorm:"column:lines_covered"`
	StatementsTotal        int       `json:"statementsTotal" gorm:"column:statements_total"`
	StatementsCovered      int       `json:"statementsCovered" gorm:"column:statements_covered"`
	NewlinesTotal          int       `json:"newlinesTotal" gorm:"column:newlines_total"`
	NewlinesCovered        int       `json:"newlinesCovered" gorm:"column:newlines_covered"`
	ChangebranchesCovered  int       `json:"changebranchesCovered" gorm:"column:changebranches_covered"`
	ChangebranchesTotal    int       `json:"changebranchesTotal" gorm:"column:changebranches_total"`
	ChangefunctionsCovered int       `json:"changefunctionsCovered" gorm:"column:changefunctions_covered"`
	ChangefunctionsTotal   int       `json:"changefunctionsTotal" gorm:"column:changefunctions_total"`
	Summary                []byte    `json:"-" gorm:"column:summary"`
	Hit                    []byte    `json:"-" gorm:"column:hit"`
	InstrumentCwd          string    `json:"instrumentCwd" gorm:"column:instrument_cwd"`
	CreatedAt              time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt              time.Time `json:"updatedAt" gorm:"column:updated_at"`
}

// TableName specifies the table name for GORM
func (Coverage) TableName() string {
	return "coverage"
}

// CoverageListRequest represents the request parameters for listing coverage
type CoverageListRequest struct {
	Page      int    `form:"page" binding:"min=1"`
	PageSize  int    `form:"pageSize" binding:"min=1,max=100"`
	ProjectID string `form:"projectId"`
	Branch    string `form:"branch"`
	Provider  string `form:"provider"`
	CovType   string `form:"covType"`
}

// CoverageListResponse represents the paginated response
type CoverageListResponse struct {
	Data       []Coverage `json:"data"`
	Total      int64      `json:"total"`
	Page       int        `json:"page"`
	PageSize   int        `json:"pageSize"`
	TotalPages int        `json:"totalPages"`
}

// DefaultPageSize is the default page size if not specified
const DefaultPageSize = 20

// MaxPageSize is the maximum allowed page size
const MaxPageSize = 100