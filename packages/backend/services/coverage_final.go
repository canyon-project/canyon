package services

import (
	"backend/models"
	"fmt"
	// "log"

	"gorm.io/gorm"
)

type CoverageFinalService struct {
	db *gorm.DB
	// In a real implementation, you would also have ClickHouse client here
	// clickhouseClient *clickhouse.Client
}

func NewCoverageFinalService(db *gorm.DB) *CoverageFinalService {
	return &CoverageFinalService{
		db: db,
	}
}

// CoverageQueryParams represents the query parameters for coverage
type CoverageQueryParams struct {
	Provider       string `form:"provider" binding:"required"`
	RepoID         string `form:"repoID" binding:"required"`
	SHA            string `form:"sha" binding:"required"`
	BuildProvider  string `form:"buildProvider"`
	BuildID        string `form:"buildID"`
	ReportProvider string `form:"reportProvider"`
	ReportID       string `form:"reportID"`
	FilePath       string `form:"filePath"`
}

// GetCoverageMap gets coverage map data
func (s *CoverageFinalService) GetCoverageMap(params CoverageQueryParams) (map[string]interface{}, error) {
	// Step 1: Query coverage table to get all coverage IDs
	var coverageList []models.CoverageFromSchema
	query := s.db.Where("provider = ? AND repo_id = ? AND sha = ?",
		params.Provider, params.RepoID, params.SHA)

	if params.BuildProvider != "" {
		query = query.Where("build_provider = ?", params.BuildProvider)
	}
	if params.BuildID != "" {
		query = query.Where("build_id = ?", params.BuildID)
	}

	err := query.Find(&coverageList).Error
	if err != nil {
		return nil, fmt.Errorf("failed to query coverage: %w", err)
	}

	if len(coverageList) == 0 {
		return map[string]interface{}{}, nil
	}

	// Step 2: Get coverage map relations
	var coverageIDs []string
	for _, coverage := range coverageList {
		coverageIDs = append(coverageIDs, coverage.ID)
	}

	var coverageMapRelations []models.CoverageMapRelation
	relationQuery := s.db.Where("coverage_id IN ?", coverageIDs)
	if params.FilePath != "" {
		relationQuery = relationQuery.Where("file_path = ?", params.FilePath)
	}

	err = relationQuery.Find(&coverageMapRelations).Error
	if err != nil {
		return nil, fmt.Errorf("failed to query coverage map relations: %w", err)
	}

	// Step 3: In a real implementation, you would query ClickHouse here
	// For now, we'll return mock data
	result := make(map[string]interface{})

	// Group relations by file path
	fileGroups := make(map[string][]models.CoverageMapRelation)
	for _, relation := range coverageMapRelations {
		fileGroups[relation.FullFilePath] = append(fileGroups[relation.FullFilePath], relation)
	}

	// Build mock coverage data for each file
	for filePath := range fileGroups {
		// Mock Istanbul.js format coverage data
		fileCoverage := map[string]interface{}{
			"path": filePath,
			"statementMap": map[string]interface{}{
				"0": map[string]interface{}{
					"start": map[string]int{"line": 1, "column": 0},
					"end":   map[string]int{"line": 1, "column": 20},
				},
			},
			"fnMap": map[string]interface{}{
				"0": map[string]interface{}{
					"name": "main",
					"decl": map[string]interface{}{
						"start": map[string]int{"line": 1, "column": 0},
						"end":   map[string]int{"line": 1, "column": 10},
					},
					"loc": map[string]interface{}{
						"start": map[string]int{"line": 1, "column": 0},
						"end":   map[string]int{"line": 10, "column": 1},
					},
				},
			},
			"branchMap": map[string]interface{}{},
			"s": map[string]int{
				"0": 1,
			},
			"f": map[string]int{
				"0": 1,
			},
			"b": map[string]interface{}{},
		}

		result[filePath] = fileCoverage
	}

	return result, nil
}

// GetCoverageSummaryMap gets coverage summary map
func (s *CoverageFinalService) GetCoverageSummaryMap(params CoverageQueryParams) (map[string]interface{}, error) {
	coverageMap, err := s.GetCoverageMap(params)
	if err != nil {
		return nil, err
	}

	// Generate summary from coverage map
	// In a real implementation, this would use canyon-data package
	summary := make(map[string]interface{})

	for filePath := range coverageMap {
		// Mock summary calculation
		fileSummary := map[string]interface{}{
			"lines": map[string]interface{}{
				"total":   10,
				"covered": 8,
				"skipped": 0,
				"pct":     80.0,
			},
			"functions": map[string]interface{}{
				"total":   2,
				"covered": 2,
				"skipped": 0,
				"pct":     100.0,
			},
			"statements": map[string]interface{}{
				"total":   15,
				"covered": 12,
				"skipped": 0,
				"pct":     80.0,
			},
			"branches": map[string]interface{}{
				"total":   5,
				"covered": 3,
				"skipped": 0,
				"pct":     60.0,
			},
		}

		summary[filePath] = fileSummary
	}

	return summary, nil
}
