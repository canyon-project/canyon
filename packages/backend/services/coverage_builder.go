package services

import (
	"backend/models"
	"fmt"
	"strings"
)

// buildCoverageMapQuery 构建coverage_map查询SQL
func (s *CoverageService) buildCoverageMapQuery(hashList []string) string {
	if len(hashList) == 0 {
		return ""
	}

	hashConditions := make([]string, len(hashList))
	for i, hash := range hashList {
		hashConditions[i] = fmt.Sprintf("'%s'", hash)
	}

	return fmt.Sprintf(`
        SELECT statement_map as statementMap,
               toString(fn_map) as fnMap,
               toString(branch_map) as branchMap,
               hash as coverageMapHashID
        FROM coverage_map
        WHERE hash IN (%s)
    `, strings.Join(hashConditions, ", "))
}

// buildCoverageHitQuery 构建coverage_hit_agg查询SQL
func (s *CoverageService) buildCoverageHitQuery(
	coverageList []models.Coverage,
	reportProvider, reportID string,
) string {
	// 过滤coverage
	var filteredCoverages []models.Coverage
	for _, coverage := range coverageList {
		reportProviderOff := reportProvider == "" || coverage.ReportProvider == reportProvider
		reportIDOff := reportID == "" || coverage.ReportID == reportID
		if reportProviderOff && reportIDOff {
			filteredCoverages = append(filteredCoverages, coverage)
		}
	}

	if len(filteredCoverages) == 0 {
		return `SELECT '' as fullFilePath, [] as s, [] as f, [] as b WHERE 1=0`
	}

	// 构建IN条件
	coverageIDs := make([]string, len(filteredCoverages))
	for i, coverage := range filteredCoverages {
		coverageIDs[i] = fmt.Sprintf("'%s'", coverage.ID)
	}

	return fmt.Sprintf(`
		SELECT
			full_file_path as fullFilePath,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b
		FROM default.coverage_hit_agg
		WHERE coverage_id IN (%s)
		GROUP BY full_file_path
	`, strings.Join(coverageIDs, ", "))
}

// buildCoverageHitQueryWithCoverageID 构建包含coverage_id的coverage_hit_agg查询SQL
func (s *CoverageService) buildCoverageHitQueryWithCoverageID(coverageList []models.Coverage) string {
	if len(coverageList) == 0 {
		return `SELECT '' as coverageID, '' as fullFilePath, [] as s WHERE 1=0`
	}

	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = fmt.Sprintf("'%s'", coverage.ID)
	}

	return fmt.Sprintf(`
		SELECT
			coverage_id as coverageID,
			full_file_path as fullFilePath,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b
		FROM default.coverage_hit_agg
		WHERE coverage_id IN (%s)
		GROUP BY coverage_id, full_file_path
	`, strings.Join(coverageIDs, ", "))
}

// buildCoverageMapQueryForSummary 构建coverage_map查询SQL - 摘要版本
func (s *CoverageService) buildCoverageMapQueryForSummary(hashList []string) string {
	if len(hashList) == 0 {
		return ""
	}

	hashConditions := make([]string, len(hashList))
	for i, hash := range hashList {
		hashConditions[i] = fmt.Sprintf("'%s'", hash)
	}

	return fmt.Sprintf(`
        SELECT hash as coverageMapHashID,
               mapKeys(statement_map) as statementKeys,
               toString(fn_map) as fnMap,
               toString(branch_map) as branchMap
        FROM coverage_map
        WHERE hash IN (%s)
    `, strings.Join(hashConditions, ", "))
}