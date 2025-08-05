package models

import "time"

// CoverageHitAgg ClickHouse覆盖率聚合表模型
type CoverageHitAgg struct {
	CoverageID   string            `json:"coverage_id"`
	FullFilePath string            `json:"full_file_path"`
	S            map[uint32]uint32 `json:"s"` // statement coverage
	F            map[uint32]uint32 `json:"f"` // function coverage
	B            map[uint32]uint32 `json:"b"` // branch coverage
	LatestTs     time.Time         `json:"latest_ts"`
}

// CoverageMap ClickHouse覆盖率映射表模型
type CoverageMap struct {
	Hash                   string                          `json:"hash"`
	StatementMap           map[uint32]StatementInfo        `json:"statement_map"`
	FnMap                  map[uint32]FunctionInfo         `json:"fn_map"`
	BranchMap              map[uint32]BranchInfo           `json:"branch_map"`
	RestoreStatementMap    map[uint32]StatementInfo        `json:"restore_statement_map"`
	RestoreFnMap           map[uint32]FunctionInfo         `json:"restore_fn_map"`
	RestoreBranchMap       map[uint32]BranchInfo           `json:"restore_branch_map"`
	Ts                     time.Time                       `json:"ts"`
}

// StatementInfo 语句覆盖率信息
type StatementInfo struct {
	StartLine   uint32 `json:"start_line"`
	StartColumn uint32 `json:"start_column"`
	EndLine     uint32 `json:"end_line"`
	EndColumn   uint32 `json:"end_column"`
}

// FunctionInfo 函数覆盖率信息
type FunctionInfo struct {
	Name     string    `json:"name"`
	Line     uint32    `json:"line"`
	StartPos [4]uint32 `json:"start_pos"` // [start_line, start_col, end_line, end_col]
	EndPos   [4]uint32 `json:"end_pos"`   // [start_line, start_col, end_line, end_col]
}

// BranchInfo 分支覆盖率信息
type BranchInfo struct {
	Type     uint8       `json:"type"`
	Line     uint32      `json:"line"`
	Position [4]uint32   `json:"position"` // [start_line, start_col, end_line, end_col]
	Paths    [][4]uint32 `json:"paths"`    // branch paths
}

// ParsedCoverageRecord 解析后的覆盖率记录
type ParsedCoverageRecord struct {
	Hash                   string                   `json:"hash"`
	StatementMap           map[uint32]StatementInfo `json:"statement_map"`
	FnMap                  map[uint32]FunctionInfo  `json:"fn_map"`
	BranchMap              map[uint32]BranchInfo    `json:"branch_map"`
	RestoreStatementMap    map[uint32]StatementInfo `json:"restore_statement_map"`
	RestoreFnMap           map[uint32]FunctionInfo  `json:"restore_fn_map"`
	RestoreBranchMap       map[uint32]BranchInfo    `json:"restore_branch_map"`
	Ts                     time.Time                `json:"ts"`
}

// CoverageMapQueryResult coverage_map查询结果
type CoverageMapQueryResult struct {
	CoverageMapHashID      string                   `json:"coverage_map_hash_id"`
	StatementMap           map[uint32]StatementInfo `json:"statement_map"`
	FnMap                  map[uint32]FunctionInfo  `json:"fn_map"`
	BranchMap              map[uint32]BranchInfo    `json:"branch_map"`
	RestoreStatementMap    map[uint32]StatementInfo `json:"restore_statement_map"`
	RestoreFnMap           map[uint32]FunctionInfo  `json:"restore_fn_map"`
	RestoreBranchMap       map[uint32]BranchInfo    `json:"restore_branch_map"`
}

// CoverageHitQueryResult coverage_hit_agg查询结果
type CoverageHitQueryResult struct {
	FullFilePath string            `json:"full_file_path"`
	S            map[uint32]uint32 `json:"s"` // statement hits
	F            map[uint32]uint32 `json:"f"` // function hits
	B            map[uint32]uint32 `json:"b"` // branch hits
}

// CoverageHitTuple ClickHouse sumMapMerge返回的tuple格式
type CoverageHitTuple struct {
	Keys   []uint32 `json:"keys"`
	Values []uint64 `json:"values"`
}