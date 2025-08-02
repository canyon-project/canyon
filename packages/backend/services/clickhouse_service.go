package services

import (
	"backend/db"
	"backend/models"
	"context"
	"time"
)

// ClickHouseService handles ClickHouse operations
type ClickHouseService struct{}

// NewClickHouseService creates a new ClickHouse service
func NewClickHouseService() *ClickHouseService {
	return &ClickHouseService{}
}

// CoverageAggResult represents aggregated coverage result
type CoverageAggResult struct {
	CoverageID   string            `json:"coverage_id"`
	FullFilePath string            `json:"full_file_path"`
	S            map[uint32]uint32 `json:"s"`
	F            map[uint32]uint32 `json:"f"`
	B            map[uint32]uint32 `json:"b"`
	LatestTs     time.Time         `json:"latest_ts"`
}

// InsertCoverageHit inserts coverage hit data
func (s *ClickHouseService) InsertCoverageHit(hit *models.CoverageHit) error {
	ctx := context.Background()
	
	query := `INSERT INTO default.coverage_hit (coverage_id, full_file_path, s, f, b, ts) VALUES (?, ?, ?, ?, ?, ?)`
	
	return db.ClickHouseDB.Exec(ctx, query, 
		hit.CoverageID, 
		hit.FullFilePath, 
		hit.S, 
		hit.F, 
		hit.B, 
		hit.Ts,
	)
}

// BatchInsertCoverageHits inserts multiple coverage hits efficiently
func (s *ClickHouseService) BatchInsertCoverageHits(hits []models.CoverageHit) error {
	ctx := context.Background()
	
	batch, err := db.ClickHouseDB.PrepareBatch(ctx, "INSERT INTO default.coverage_hit")
	if err != nil {
		return err
	}
	
	for _, hit := range hits {
		err := batch.Append(
			hit.CoverageID,
			hit.FullFilePath,
			hit.S,
			hit.F,
			hit.B,
			hit.Ts,
		)
		if err != nil {
			return err
		}
	}
	
	return batch.Send()
}

// InsertCoverageMap inserts coverage map data
func (s *ClickHouseService) InsertCoverageMap(coverageMap *models.CoverageMap) error {
	ctx := context.Background()
	
	query := `INSERT INTO default.coverage_map (hash, statement_map, fn_map, branch_map, restore_statement_map, restore_fn_map, restore_branch_map, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	
	return db.ClickHouseDB.Exec(ctx, query,
		coverageMap.Hash,
		coverageMap.StatementMap,
		coverageMap.FnMap,
		coverageMap.BranchMap,
		coverageMap.RestoreStatementMap,
		coverageMap.RestoreFnMap,
		coverageMap.RestoreBranchMap,
		coverageMap.Ts,
	)
}

// GetCoverageAggregation retrieves aggregated coverage data
func (s *ClickHouseService) GetCoverageAggregation(coverageID string) ([]CoverageAggResult, error) {
	ctx := context.Background()
	
	query := `
		SELECT
			coverage_id,
			full_file_path,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b,
			latest_ts
		FROM default.coverage_hit_agg
		WHERE coverage_id = ?
		GROUP BY coverage_id, full_file_path, latest_ts
	`
	
	rows, err := db.ClickHouseDB.Query(ctx, query, coverageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var results []CoverageAggResult
	for rows.Next() {
		var result CoverageAggResult
		err := rows.Scan(
			&result.CoverageID,
			&result.FullFilePath,
			&result.S,
			&result.F,
			&result.B,
			&result.LatestTs,
		)
		if err != nil {
			return nil, err
		}
		results = append(results, result)
	}
	
	return results, nil
}

// GetCoverageHitsByTimeRange retrieves coverage hits within a time range
func (s *ClickHouseService) GetCoverageHitsByTimeRange(coverageID string, startTime, endTime time.Time) ([]models.CoverageHit, error) {
	ctx := context.Background()
	
	query := `
		SELECT coverage_id, full_file_path, s, f, b, ts
		FROM default.coverage_hit
		WHERE coverage_id = ? AND ts >= ? AND ts <= ?
		ORDER BY ts DESC
	`
	
	rows, err := db.ClickHouseDB.Query(ctx, query, coverageID, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var hits []models.CoverageHit
	for rows.Next() {
		var hit models.CoverageHit
		err := rows.Scan(
			&hit.CoverageID,
			&hit.FullFilePath,
			&hit.S,
			&hit.F,
			&hit.B,
			&hit.Ts,
		)
		if err != nil {
			return nil, err
		}
		hits = append(hits, hit)
	}
	
	return hits, nil
}

// GetCoverageMap retrieves coverage map by hash
func (s *ClickHouseService) GetCoverageMap(hash string) (*models.CoverageMap, error) {
	ctx := context.Background()
	
	query := `
		SELECT hash, statement_map, fn_map, branch_map, restore_statement_map, restore_fn_map, restore_branch_map, ts
		FROM default.coverage_map
		WHERE hash = ?
		ORDER BY ts DESC
		LIMIT 1
	`
	
	row := db.ClickHouseDB.QueryRow(ctx, query, hash)
	
	var coverageMap models.CoverageMap
	err := row.Scan(
		&coverageMap.Hash,
		&coverageMap.StatementMap,
		&coverageMap.FnMap,
		&coverageMap.BranchMap,
		&coverageMap.RestoreStatementMap,
		&coverageMap.RestoreFnMap,
		&coverageMap.RestoreBranchMap,
		&coverageMap.Ts,
	)
	
	if err != nil {
		return nil, err
	}
	
	return &coverageMap, nil
}