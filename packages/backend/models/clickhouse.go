package models

import (
	"time"
)

// CoverageHit represents the coverage_hit table structure
type CoverageHit struct {
	CoverageID   string            `ch:"coverage_id"`
	FullFilePath string            `ch:"full_file_path"`
	S            map[uint32]uint32 `ch:"s"`
	F            map[uint32]uint32 `ch:"f"`
	B            map[uint32]uint32 `ch:"b"`
	Ts           time.Time         `ch:"ts"`
}

// CoverageMap represents the coverage_map table structure
type CoverageMap struct {
	Hash                 string                                    `ch:"hash"`
	StatementMap         map[uint32][4]uint32                     `ch:"statement_map"`
	FnMap                map[uint32]FunctionMapEntry              `ch:"fn_map"`
	BranchMap            map[uint32]BranchMapEntry                `ch:"branch_map"`
	RestoreStatementMap  map[uint32][4]uint32                     `ch:"restore_statement_map"`
	RestoreFnMap         map[uint32]FunctionMapEntry              `ch:"restore_fn_map"`
	RestoreBranchMap     map[uint32]BranchMapEntry                `ch:"restore_branch_map"`
	Ts                   time.Time                                 `ch:"ts"`
}

// FunctionMapEntry represents function map entry structure
type FunctionMapEntry struct {
	Name     string     `ch:"name"`
	Line     uint32     `ch:"line"`
	StartLoc [4]uint32  `ch:"start_loc"`
	EndLoc   [4]uint32  `ch:"end_loc"`
}

// BranchMapEntry represents branch map entry structure
type BranchMapEntry struct {
	Type      uint8       `ch:"type"`
	Line      uint32      `ch:"line"`
	Loc       [4]uint32   `ch:"loc"`
	Locations [][4]uint32 `ch:"locations"`
}