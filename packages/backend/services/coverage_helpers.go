package services

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
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

	// 调用外部测试用例服务，按 (reportProvider, reportID) 去重
	type pair struct{ provider, id string }
	seen := make(map[pair]bool)
	for _, item := range needTestCaseItems {
		p := pair{provider: item.ReportProvider, id: item.ReportID}
		if seen[p] {
			continue
		}
		seen[p] = true

		info := s.fetchExternalTestCaseInfo(p.provider, p.id)
		testCaseInfoList = append(testCaseInfoList, info)
	}

	return testCaseInfoList, nil
}

// fetchExternalTestCaseInfo 从外部用例服务拉取用例结果信息
func (s *CoverageService) fetchExternalTestCaseInfo(reportProvider, reportID string) map[string]interface{} {
	base := s.getTestCaseBaseURL()
	q := url.Values{}
	q.Set("report_provider", reportProvider)
	q.Set("report_id", reportID)
	requestURL := base + "?" + q.Encode()

	defaultInfo := map[string]interface{}{
		"caseName":       reportID,
		"passedCount":    0,
		"failedCount":    0,
		"totalCount":     0,
		"passRate":       "100.00%",
		"reportProvider": reportProvider,
		"reportID":       reportID,
		"caseUrl":        "",
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return defaultInfo
	}

	resp, err := client.Do(req)
	if err != nil {
		return defaultInfo
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return defaultInfo
	}

	var body map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return defaultInfo
	}

	// 尝试提取字段，缺失则回退默认
	getNumber := func(m map[string]interface{}, keys ...string) float64 {
		for _, k := range keys {
			if v, ok := m[k]; ok {
				switch vv := v.(type) {
				case float64:
					return vv
				case int:
					return float64(vv)
				case int64:
					return float64(vv)
				case json.Number:
					fv, _ := vv.Float64()
					return fv
				}
			}
		}
		return 0
	}

	getString := func(m map[string]interface{}, keys ...string) string {
		for _, k := range keys {
			if v, ok := m[k]; ok {
				if s, ok := v.(string); ok && s != "" {
					return s
				}
			}
		}
		return ""
	}

	caseName := getString(body, "caseName", "name", "title")
	passed := getNumber(body, "passed", "pass", "passedCount")
	failed := getNumber(body, "failed", "fail", "failedCount")
	total := getNumber(body, "total", "totalCount")
	if total == 0 {
		total = passed + failed
	}
	// Prefer external passRate if provided
	passRate := getString(body, "passRate")
	if passRate == "" {
		passRate = "100.00%"
		if total > 0 {
			r := (passed / total) * 100.0
			passRate = fmt.Sprintf("%.2f%%", r)
		}
	}

	// Extract caseUrl if provided by response
	caseUrl := getString(body, "caseUrl")

	info := map[string]interface{}{
		"caseName": func() string {
			if caseName != "" {
				return caseName
			}
			return reportID
		}(),
		"passedCount":    int(passed),
		"failedCount":    int(failed),
		"totalCount":     int(total),
		"passRate":       passRate,
		"reportProvider": reportProvider,
		"reportID":       reportID,
		"caseUrl": func() string {
			if caseUrl != "" {
				return caseUrl
			}
			return ""
		}(),
	}

	return info
}

// getTestCaseBaseURL 从配置表读取测试用例服务基础地址
func (s *CoverageService) getTestCaseBaseURL() string {
	pgDB := db.GetDB()
	var cfg models.Config
	if err := pgDB.Where("key = ?", "system_config.test_case_url").First(&cfg).Error; err == nil {
		if cfg.Value != "" {
			return cfg.Value
		}
	}
	return "http://test-case.com/report"
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
			sKeys        []interface{}
			fnMapStr     string
			branchMapStr string
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
