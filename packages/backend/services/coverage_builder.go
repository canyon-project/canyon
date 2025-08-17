package services

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

// buildCoverageMapQuery 构建coverage_map查询SQL
func (s *CoverageService) buildCoverageMapQuery(hashList []string) string {
	if len(hashList) == 0 {
		return ""
	}

	inClause := utils.Query.BuildInClause("hash", hashList)
	return fmt.Sprintf(`
        SELECT statement_map as statementMap,
               toString(fn_map) as fnMap,
               toString(branch_map) as branchMap,
               hash as coverageMapHashID
        FROM coverage_map
        WHERE %s
    `, inClause)
}

// buildCoverageHitQuery 构建coverage_hit_agg查询SQL
func (s *CoverageService) buildCoverageHitQuery(
	coverageList []models.Coverage,
	reportProvider, reportID string,
) string {
	// 过滤coverage
	filteredCoverages := s.filterCoveragesByReport(coverageList, reportProvider, reportID)
	if len(filteredCoverages) == 0 {
		return `SELECT '' as fullFilePath, [] as s, [] as f, [] as b WHERE 1=0`
	}

	// 提取coverage IDs
	coverageIDs := s.extractCoverageIDs(filteredCoverages)
	inClause := utils.Query.BuildInClause("coverage_id", coverageIDs)

	return fmt.Sprintf(`
		SELECT
			full_file_path as fullFilePath,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b
		FROM default.coverage_hit_agg
		WHERE %s
		GROUP BY full_file_path
	`, inClause)
}

// buildCoverageHitQueryWithCoverageID 构建包含coverage_id的coverage_hit_agg查询SQL
func (s *CoverageService) buildCoverageHitQueryWithCoverageID(coverageList []models.Coverage) string {
	if len(coverageList) == 0 {
		return `SELECT '' as coverageID, '' as fullFilePath, [] as s WHERE 1=0`
	}

	coverageIDs := s.extractCoverageIDs(coverageList)
	inClause := utils.Query.BuildInClause("coverage_id", coverageIDs)

	return fmt.Sprintf(`
		SELECT
			coverage_id as coverageID,
			full_file_path as fullFilePath,
			sumMapMerge(s) AS s
		FROM default.coverage_hit_agg
		WHERE %s
		GROUP BY coverage_id, full_file_path
	`, inClause)
}

// buildCoverageMapQueryForSummary 构建coverage_map查询SQL - 摘要版本
func (s *CoverageService) buildCoverageMapQueryForSummary(hashList []string) string {
	if len(hashList) == 0 {
		return ""
	}

	inClause := utils.Query.BuildInClause("hash", hashList)
	return fmt.Sprintf(`
        SELECT hash as coverageMapHashID,
               mapKeys(statement_map) as statementKeys
        FROM coverage_map
        WHERE %s
    `, inClause)
}

// filterCoveragesByReport 根据报告提供商和报告ID过滤coverage
func (s *CoverageService) filterCoveragesByReport(coverageList []models.Coverage, reportProvider, reportID string) []models.Coverage {
	var filteredCoverages []models.Coverage
	for _, coverage := range coverageList {
		reportProviderOff := reportProvider == "" || coverage.ReportProvider == reportProvider
		reportIDOff := reportID == "" || coverage.ReportID == reportID
		if reportProviderOff && reportIDOff {
			filteredCoverages = append(filteredCoverages, coverage)
		}
	}
	return filteredCoverages
}

// extractCoverageIDs 提取coverage ID列表
func (s *CoverageService) extractCoverageIDs(coverageList []models.Coverage) []string {
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = coverage.ID
	}
	return coverageIDs
}
