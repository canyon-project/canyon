package models

import (
	"time"
)

// CoverageHit represents the coverage_hit table structure
type CoverageHit struct {
	CoverageID   string            `ch:"coverage_id" json:"coverage_id"`
	FullFilePath string            `ch:"full_file_path" json:"full_file_path"`
	S            map[uint32]uint32 `ch:"s" json:"s"`
	F            map[uint32]uint32 `ch:"f" json:"f"`
	B            map[uint32]uint32 `ch:"b" json:"b"`
	Ts           time.Time         `ch:"ts" json:"ts"`
}

// CoverageMap represents the coverage_map table structure
type CoverageMap struct {
	Hash                 string                                    `ch:"hash" json:"hash"`
	StatementMap         map[uint32][4]uint32                     `ch:"statement_map" json:"statement_map"`
	FnMap                map[uint32]FunctionMapEntry              `ch:"fn_map" json:"fn_map"`
	BranchMap            map[uint32]BranchMapEntry                `ch:"branch_map" json:"branch_map"`
	RestoreStatementMap  map[uint32][4]uint32                     `ch:"restore_statement_map" json:"restore_statement_map"`
	RestoreFnMap         map[uint32]FunctionMapEntry              `ch:"restore_fn_map" json:"restore_fn_map"`
	RestoreBranchMap     map[uint32]BranchMapEntry                `ch:"restore_branch_map" json:"restore_branch_map"`
	Ts                   time.Time                                 `ch:"ts" json:"ts"`
}

// FunctionMapEntry represents function map entry structure
type FunctionMapEntry struct {
	Name     string     `ch:"name" json:"name"`
	Line     uint32     `ch:"line" json:"line"`
	StartLoc [4]uint32  `ch:"start_loc" json:"start_loc"`
	EndLoc   [4]uint32  `ch:"end_loc" json:"end_loc"`
}

// BranchMapEntry represents branch map entry structure
type BranchMapEntry struct {
	Type      uint8       `ch:"type" json:"type"`
	Line      uint32      `ch:"line" json:"line"`
	Loc       [4]uint32   `ch:"loc" json:"loc"`
	Locations [][4]uint32 `ch:"locations" json:"locations"`
}