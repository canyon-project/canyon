package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// JSON 使用json.RawMessage来处理任意JSON数据（对象或数组）
type JSON json.RawMessage

// BaseModel 基础模型
type BaseModel struct {
	ID        string         `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// User 用户模型
type User struct {
	ID        string    `gorm:"primarykey" json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Password  string    `json:"-"` // 不返回密码
	Nickname  string    `json:"nickname"`
	Avatar    string    `json:"avatar"`
	Favor     string    `json:"favor"`
	Settings  JSON      `gorm:"type:json" json:"settings"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
}

// TableName 指定表名
func (User) TableName() string {
	return "canyonjs_user"
}

// Repo 仓库模型
type Repo struct {
	ID                string    `gorm:"primarykey" json:"id"`
	PathWithNamespace string    `gorm:"column:path_with_namespace" json:"pathWithNamespace"`
	Description       string    `json:"description"`
	Bu                string    `json:"bu"`
	Tags              JSON      `gorm:"type:json" json:"tags"`
	Members           JSON      `gorm:"type:json" json:"members"`
	Scopes            JSON      `gorm:"type:json" json:"scopes"`
	CreatedAt         time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"column:updated_at" json:"updatedAt"`
	// 前端期望的额外字段
	ReportTimes     int       `json:"reportTimes"`
	MaxCoverage     float64   `json:"maxCoverage"`
	LastReportTime  time.Time `json:"lastReportTime"`
	Favored         bool      `json:"favored"`
}

// TableName 指定表名
func (Repo) TableName() string {
	return "canyonjs_repo"
}

// Coverage 覆盖率模型
type Coverage struct {
	ID             string    `gorm:"primarykey" json:"id"`
	InstrumentCwd  string    `gorm:"column:instrument_cwd" json:"instrumentCwd"`
	SHA            string    `gorm:"column:sha" json:"sha"`
	Branch         string    `json:"branch"`
	CompareTarget  string    `gorm:"column:compare_target" json:"compareTarget"`
	Provider       string    `json:"provider"`
	BuildProvider  string    `gorm:"column:build_provider" json:"buildProvider"`
	BuildID        string    `gorm:"column:build_id" json:"buildId"`
	RepoID         string    `gorm:"column:repo_id" json:"repoId"`
	Reporter       string    `json:"reporter"`
	ReportProvider string    `gorm:"column:report_provider" json:"reportProvider"`
	ReportID       string    `gorm:"column:report_id" json:"reportId"`
	ScopeID        string    `gorm:"column:scope_id" json:"scopeId"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// TableName 指定表名
func (Coverage) TableName() string {
	return "canyonjs_coverage"
}

// CoverageHitSummaryResult ClickHouse查询结果 - 覆盖率命中摘要
type CoverageHitSummaryResult struct {
	CoverageID   string            `json:"coverageID"`
	FullFilePath string            `json:"fullFilePath"`
	S            map[uint32]uint32 `json:"s"`
	F            map[uint32]uint32 `json:"f"`
	B            map[uint32]uint32 `json:"b"`
}

// CoverageMapSummaryResult ClickHouse查询结果 - 覆盖率映射摘要
type CoverageMapSummaryResult struct {
	Hash string   `json:"hash"`
	S    []uint32 `json:"s"`
	F    []uint32 `json:"f"`
	B    []uint32 `json:"b"`
}

// CoverageMapSummaryResultWithFilePath 带文件路径的覆盖率映射摘要结果
type CoverageMapSummaryResultWithFilePath struct {
	CoverageMapSummaryResult
	FullFilePath string `json:"fullFilePath"`
}

// Config 配置模型
type Config struct {
	ID        string    `gorm:"primarykey" json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// TableName 指定表名
func (Config) TableName() string {
	return "canyonjs_config"
}