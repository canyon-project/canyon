package models

import (
	"time"
)

// Repo represents the repository data structure based on Prisma schema
type Repo struct {
	ID                string    `json:"id" gorm:"primaryKey;column:id"`
	PathWithNamespace string    `json:"pathWithNamespace" gorm:"column:path_with_namespace"`
	Description       string    `json:"description" gorm:"column:description"`
	BU                string    `json:"bu" gorm:"column:bu"`
	Tags              []byte    `json:"-" gorm:"column:tags;type:jsonb"`
	Members           []byte    `json:"-" gorm:"column:members;type:jsonb"`
	Scopes            []byte    `json:"-" gorm:"column:scopes;type:jsonb"`
	CreatedAt         time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt         time.Time `json:"updatedAt" gorm:"column:updated_at"`
}

// TableName specifies the table name for GORM
func (Repo) TableName() string {
	return "canyonjs_repo"
}

// RepoWithStats represents repo with additional statistics
type RepoWithStats struct {
	Repo
	ReportTimes    int       `json:"reportTimes"`
	LastReportTime time.Time `json:"lastReportTime"`
}

// CommitDetail represents git commit information
type CommitDetail struct {
	ID           string    `json:"id"`
	Message      string    `json:"message"`
	AuthorName   string    `json:"author_name"`
	AuthoredDate time.Time `json:"authored_date"`
}

// CommitWithCoverage represents commit with coverage details
type CommitWithCoverage struct {
	SHA            string             `json:"sha"`
	CommitDetail   *CommitDetail      `json:"commitDetail"`
	CoverageDetail []CoverageForRepo  `json:"coverageDetail"`
}

// CoverageForRepo represents coverage data for repo context
type CoverageForRepo struct {
	ID             string    `json:"id"`
	InstrumentCwd  string    `json:"instrumentCwd"`
	SHA            string    `json:"sha"`
	Branch         string    `json:"branch"`
	CompareTarget  string    `json:"compareTarget"`
	Provider       string    `json:"provider"`
	BuildProvider  string    `json:"buildProvider"`
	BuildID        string    `json:"buildID"`
	RepoID         string    `json:"repoID"`
	Reporter       string    `json:"reporter"`
	ReportProvider string    `json:"reportProvider"`
	ReportID       string    `json:"reportID"`
	ScopeID        string    `json:"scopeID"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// CoverageMapRelation represents the coverage map relation
type CoverageMapRelation struct {
	ID                  string `json:"id" gorm:"primaryKey;column:id"`
	FullFilePath        string `json:"fullFilePath" gorm:"column:full_file_path"`
	FilePath            string `json:"filePath" gorm:"column:file_path"`
	RestoreFullFilePath string `json:"restoreFullFilePath" gorm:"column:restore_full_file_path"`
	CoverageMapHashID   string `json:"coverageMapHashID" gorm:"column:coverage_map_hash_id"`
	CoverageID          string `json:"coverageID" gorm:"column:coverage_id"`
	SourceMapHashID     string `json:"sourceMapHashID" gorm:"column:source_map_hash_id"`
}

// TableName specifies the table name for GORM
func (CoverageMapRelation) TableName() string {
	return "canyonjs_coverage_map_relation"
}

// CoverageFromSchema represents coverage data from Prisma schema
type CoverageFromSchema struct {
	ID             string    `json:"id" gorm:"primaryKey;column:id"`
	InstrumentCwd  string    `json:"instrumentCwd" gorm:"column:instrument_cwd"`
	SHA            string    `json:"sha" gorm:"column:sha"`
	Branch         string    `json:"branch" gorm:"column:branch"`
	CompareTarget  string    `json:"compareTarget" gorm:"column:compare_target"`
	Provider       string    `json:"provider" gorm:"column:provider"`
	BuildProvider  string    `json:"buildProvider" gorm:"column:build_provider"`
	BuildID        string    `json:"buildID" gorm:"column:build_id"`
	RepoID         string    `json:"repoID" gorm:"column:repo_id"`
	Reporter       string    `json:"reporter" gorm:"column:reporter"`
	ReportProvider string    `json:"reportProvider" gorm:"column:report_provider"`
	ReportID       string    `json:"reportID" gorm:"column:report_id"`
	ScopeID        string    `json:"scopeID" gorm:"column:scope_id"`
	CreatedAt      time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"column:updated_at"`
}

// TableName specifies the table name for GORM
func (CoverageFromSchema) TableName() string {
	return "canyonjs_coverage"
}