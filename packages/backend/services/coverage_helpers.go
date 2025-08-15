package services

import (
	"backend/db"
	"backend/models"
	"context"
	"fmt"
	"time"
)

// getTestCaseInfoList 获取测试用例信息列表
func (s *CoverageService) getTestCaseInfoList(coverageList []models.Coverage) ([]interface{}, error) {
	var testCaseInfoList []interface{}

	// 过滤出需要获取测试用例信息的覆盖率项
	var needTestCaseItems []models.Coverage
	for _, item := range coverageList {
		if item.ReportProvider == "mpaas" || item.ReportProvider == "flytest" {
			needTestCaseItems = append(needTestCaseItems, item)
		}
	}

	// 这里应该调用外部API获取测试用例信息
	// 由于Go中没有直接的axios等价物，这里先返回空列表
	// TODO: 实现HTTP客户端调用外部API
	for _, item := range needTestCaseItems {
		testCaseInfo := map[string]interface{}{
			"caseName":       item.ReportID,
			"passedCount":    0,
			"failedCount":    0,
			"totalCount":     0,
			"passRate":       "100%",
			"reportProvider": item.ReportProvider,
			"reportID":       item.ReportID,
		}
		testCaseInfoList = append(testCaseInfoList, testCaseInfo)
	}

	return testCaseInfoList, nil
}

// buildBuildGroupList 构建构建组列表
func (s *CoverageService) buildBuildGroupList(coverageList []models.Coverage) []map[string]string {
	var buildGroupList []map[string]string
	for _, coverage := range coverageList {
		buildGroupList = append(buildGroupList, map[string]string{
			"buildProvider": coverage.BuildProvider,
			"buildID":       coverage.BuildID,
		})
	}
	return buildGroupList
}

// getCoverageMapRelationList 获取覆盖率映射关系列表
func (s *CoverageService) getCoverageMapRelationList(coverageList []models.Coverage) ([]struct {
	CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
	FullFilePath      string `gorm:"column:full_file_path"`
}, error) {
	pgDB := db.GetDB()
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = coverage.ID
	}

	var coverageMapRelationList []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}

	err := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", coverageIDs).
		Group("coverage_map_hash_id, full_file_path").
		Find(&coverageMapRelationList).Error

	return coverageMapRelationList, err
}

// queryClickHouseForSummary 查询ClickHouse获取摘要数据
func (s *CoverageService) queryClickHouseForSummary(
	coverageList []models.Coverage,
	coverageMapRelationList []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
) ([]models.CoverageHitSummaryResult, []models.CoverageMapSummaryResult, error) {
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 查询coverage_hit_agg - 使用自定义查询以获取coverage_id
	coverageHitQuery := s.buildCoverageHitQueryWithCoverageID(coverageList)
	hitRows, err := conn.Query(ctx, coverageHitQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer hitRows.Close()

	var coverageHitData []models.CoverageHitSummaryResult
	for hitRows.Next() {
		var (
			coverageID, fullFilePath string
			sTuple, fTuple, bTuple   []interface{}
		)
		err := hitRows.Scan(
			&coverageID,
			&fullFilePath,
			&sTuple,
			&fTuple,
			&bTuple,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		// 转换tuple slice为uint32 map
		result := models.CoverageHitSummaryResult{
			CoverageID:   coverageID,
			FullFilePath: fullFilePath,
			S:            s.convertTupleSliceToUint32Map(sTuple),
			F:            s.convertTupleSliceToUint32Map(fTuple),
			B:            s.convertTupleSliceToUint32Map(bTuple),
		}
		coverageHitData = append(coverageHitData, result)
	}

	// 查询coverage_map
	hashList := s.deduplicateHashIDList(coverageMapRelationList)

	if len(hashList) == 0 {
		return coverageHitData, []models.CoverageMapSummaryResult{}, nil
	}

	coverageMapQuery := s.buildCoverageMapQueryForSummary(hashList)
	mapRows, err := conn.Query(ctx, coverageMapQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()

	var coverageMapData []models.CoverageMapSummaryResult
	for mapRows.Next() {
		var result models.CoverageMapSummaryResult
		var (
			sKeys           []interface{}
			fnMapStr        string
			branchMapStr    string
		)

		err := mapRows.Scan(
			&result.Hash,
			&sKeys,
			&fnMapStr,
			&branchMapStr,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}

		// 解析数据
		result.S = s.convertInterfaceSliceToUint32Slice(sKeys)
		result.F = s.extractKeysFromFunctionMapString(fnMapStr)
		result.B = s.extractKeysFromBranchMapString(branchMapStr)
		coverageMapData = append(coverageMapData, result)
	}

	return coverageHitData, coverageMapData, nil
}

// mergeCoverageMapWithFilePath 合并覆盖率映射数据与文件路径
func (s *CoverageService) mergeCoverageMapWithFilePath(
	coverageMapRelationList []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
	coverageMapData []models.CoverageMapSummaryResult,
) []models.CoverageMapSummaryResultWithFilePath {
	var result []models.CoverageMapSummaryResultWithFilePath

	for _, relation := range coverageMapRelationList {
		for _, mapData := range coverageMapData {
			if mapData.Hash == relation.CoverageMapHashID {
				result = append(result, models.CoverageMapSummaryResultWithFilePath{
					CoverageMapSummaryResult: mapData,
					FullFilePath:             relation.FullFilePath,
				})
				break
			}
		}
	}

	return result
}

// deduplicateBuildGroupList 去重构建组列表
func (s *CoverageService) deduplicateBuildGroupList(buildGroupList []map[string]string) []map[string]string {
	seen := make(map[string]bool)
	var result []map[string]string

	for _, group := range buildGroupList {
		key := fmt.Sprintf("%s-%s", group["buildProvider"], group["buildID"])
		if !seen[key] {
			seen[key] = true
			result = append(result, group)
		}
	}

	return result
}

// deduplicateHashIDList 去重hash ID列表
func (s *CoverageService) deduplicateHashIDList(coverageMapRelationList []struct {
	CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
	FullFilePath      string `gorm:"column:full_file_path"`
}) []string {
	hashSet := make(map[string]bool)
	var hashList []string

	for _, relation := range coverageMapRelationList {
		if !hashSet[relation.CoverageMapHashID] {
			hashSet[relation.CoverageMapHashID] = true
			hashList = append(hashList, relation.CoverageMapHashID)
		}
	}

	return hashList
}

// getTestCaseInfo 获取测试用例信息
func (s *CoverageService) getTestCaseInfo(testCaseInfoList []interface{}, reportID, reportProvider string) map[string]interface{} {
	for _, item := range testCaseInfoList {
		if info, ok := item.(map[string]interface{}); ok {
			if info["reportID"] == reportID && info["reportProvider"] == reportProvider {
				return info
			}
		}
	}

	// 如果没有找到，返回默认值
	return map[string]interface{}{
		"caseName":       reportID,
		"passedCount":    0,
		"failedCount":    0,
		"totalCount":     0,
		"passRate":       "100%",
		"reportProvider": reportProvider,
		"reportID":       reportID,
	}
}