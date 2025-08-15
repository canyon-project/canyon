package services

import (
	"backend/models"
	"backend/utils"
	"fmt"
)

// calcCoverageSummary 计算覆盖率摘要
func (s *CoverageService) calcCoverageSummary(
	coverageHit []models.CoverageHitSummaryResult,
	coverageMap []models.CoverageMapSummaryResultWithFilePath,
) map[string]interface{} {
	// 构建hitMap - 使用与TypeScript代码相同的逻辑
	hitMap := make(map[string]map[uint32]bool)
	for _, hit := range coverageHit {
		path := hit.FullFilePath
		if hitMap[path] == nil {
			hitMap[path] = make(map[uint32]bool)
		}
		// 将hit.S中的键添加到hitMap中
		for key := range hit.S {
			hitMap[path][key] = true
		}
	}

	// 计算覆盖的语句数
	covered := 0
	for _, hitSet := range hitMap {
		covered += len(hitSet)
	}

	// 计算总语句数
	total := 0
	for _, mapItem := range coverageMap {
		total += len(mapItem.S)
	}

	// 计算百分比
	percent := "0%"
	if total > 0 {
		percentValue := float64(covered) / float64(total) * 100
		percent = fmt.Sprintf("%.1f%%", percentValue)
	}

	return map[string]interface{}{
		"total":   total,
		"covered": covered,
		"percent": percent,
	}
}

// filterCoverageHit 过滤覆盖率命中数据
func (s *CoverageService) filterCoverageHit(
	coverageList []models.Coverage,
	coverageHitData []models.CoverageHitSummaryResult,
) []models.CoverageHitSummaryResult {
	// 构建coverageID集合
	coverageIDSet := make(map[string]bool)
	for _, coverage := range coverageList {
		coverageIDSet[coverage.ID] = true
	}

	// 过滤出匹配的hit数据
	var filtered []models.CoverageHitSummaryResult
	for _, hit := range coverageHitData {
		if coverageIDSet[hit.CoverageID] {
			filtered = append(filtered, hit)
		}
	}

	return filtered
}

// buildResultList 构建结果列表
func (s *CoverageService) buildResultList(
	deduplicatedBuildGroupList []map[string]string,
	coverageList []models.Coverage,
	coverageHitData []models.CoverageHitSummaryResult,
	coverageMapWithFilePath []models.CoverageMapSummaryResultWithFilePath,
	testCaseInfoList []interface{},
) []interface{} {
	var resultList []interface{}

	for _, buildGroup := range deduplicatedBuildGroupList {
		buildID := buildGroup["buildID"]
		buildProvider := buildGroup["buildProvider"]

		// 过滤当前构建组的覆盖率项
		var currentBuildCoverages []models.Coverage
		for _, coverage := range coverageList {
			if coverage.BuildProvider == buildProvider && coverage.BuildID == buildID {
				currentBuildCoverages = append(currentBuildCoverages, coverage)
			}
		}

		// 计算总体摘要
		summary := s.calcCoverageSummary(
			s.filterCoverageHit(currentBuildCoverages, coverageHitData),
			coverageMapWithFilePath,
		)

		// 构建模式列表
		modeList := []map[string]interface{}{
			// 自动模式
			s.buildAutoMode(currentBuildCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList),
			// 手动模式
			s.buildManualMode(currentBuildCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList),
		}

		group := map[string]interface{}{
			"buildID":       buildID,
			"buildProvider": buildProvider,
			"summary":       summary,
			"modeList":      modeList,
		}

		resultList = append(resultList, group)
	}

	return resultList
}

// buildAutoMode 构建自动模式
func (s *CoverageService) buildAutoMode(
	coverageList []models.Coverage,
	coverageHitData []models.CoverageHitSummaryResult,
	coverageMapWithFilePath []models.CoverageMapSummaryResultWithFilePath,
	testCaseInfoList []interface{},
) map[string]interface{} {
	// 过滤自动测试覆盖率项
	var autoCoverages []models.Coverage
	for _, coverage := range coverageList {
		if coverage.ReportProvider == "mpaas" || coverage.ReportProvider == "flytest" {
			autoCoverages = append(autoCoverages, coverage)
		}
	}

	summary := s.calcCoverageSummary(
		s.filterCoverageHit(autoCoverages, coverageHitData),
		coverageMapWithFilePath,
	)

	caseList := s.buildCaseList(autoCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList)

	return map[string]interface{}{
		"mode":     "auto",
		"summary":  summary,
		"caseList": caseList,
	}
}

// buildManualMode 构建手动模式
func (s *CoverageService) buildManualMode(
	coverageList []models.Coverage,
	coverageHitData []models.CoverageHitSummaryResult,
	coverageMapWithFilePath []models.CoverageMapSummaryResultWithFilePath,
	testCaseInfoList []interface{},
) map[string]interface{} {
	// 过滤手动测试覆盖率项
	var manualCoverages []models.Coverage
	for _, coverage := range coverageList {
		if coverage.ReportProvider == "person" {
			manualCoverages = append(manualCoverages, coverage)
		}
	}

	summary := s.calcCoverageSummary(
		s.filterCoverageHit(manualCoverages, coverageHitData),
		coverageMapWithFilePath,
	)

	caseList := s.buildCaseList(manualCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList)

	return map[string]interface{}{
		"mode":     "manual",
		"summary":  summary,
		"caseList": caseList,
	}
}

// buildCaseList 构建用例列表
func (s *CoverageService) buildCaseList(
	coverageList []models.Coverage,
	coverageHitData []models.CoverageHitSummaryResult,
	coverageMapWithFilePath []models.CoverageMapSummaryResultWithFilePath,
	testCaseInfoList []interface{},
) []interface{} {
	var caseList []interface{}

	for _, coverage := range coverageList {
		// 计算单个用例的摘要
		singleCoverageList := []models.Coverage{coverage}
		summary := s.calcCoverageSummary(
			s.filterCoverageHit(singleCoverageList, coverageHitData),
			coverageMapWithFilePath,
		)

		// 获取测试用例信息
		testCaseInfo := s.getTestCaseInfo(testCaseInfoList, coverage.ReportID, coverage.ReportProvider)

		caseItem := map[string]interface{}{
			"id":             coverage.ID,
			"repoID":         coverage.RepoID,
			"sha":            coverage.SHA,
			"buildProvider":  coverage.BuildProvider,
			"buildID":        coverage.BuildID,
			"reportProvider": coverage.ReportProvider,
			"reportID":       coverage.ReportID,
			"summary":        summary,
		}

		// 合并测试用例信息
		for key, value := range testCaseInfo {
			caseItem[key] = value
		}

		caseList = append(caseList, caseItem)
	}

	return caseList
}

// extractKeysFromStatementMap 从语句映射中提取键
func (s *CoverageService) extractKeysFromStatementMap(statementMap map[uint32]models.StatementInfo) []uint32 {
	var keys []uint32
	for key := range statementMap {
		keys = append(keys, key)
	}
	return keys
}

// extractKeysFromFunctionMap 从函数映射中提取键
func (s *CoverageService) extractKeysFromFunctionMap(functionMap map[uint32][]interface{}) []uint32 {
	var keys []uint32
	for key := range functionMap {
		keys = append(keys, key)
	}
	return keys
}

// extractKeysFromFunctionMapString 从函数映射字符串中提取键
func (s *CoverageService) extractKeysFromFunctionMapString(fnMapStr string) []uint32 {
	fnMap := utils.ParseFunctionMapSimple(fnMapStr)
	var keys []uint32
	for key := range fnMap {
		keys = append(keys, key)
	}
	return keys
}

// extractKeysFromBranchMapString 从分支映射字符串中提取键
func (s *CoverageService) extractKeysFromBranchMapString(branchMapStr string) []uint32 {
	branchMap := utils.ParseBranchMapSimple(branchMapStr)
	var keys []uint32
	for key := range branchMap {
		keys = append(keys, key)
	}
	return keys
}

// extractKeysFromBranchMap 从分支映射中提取键
func (s *CoverageService) extractKeysFromBranchMap(branchMap map[uint32][]interface{}) []uint32 {
	var keys []uint32
	for key := range branchMap {
		keys = append(keys, key)
	}
	return keys
}