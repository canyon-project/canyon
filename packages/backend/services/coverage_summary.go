package services

import (
	"backend/db"
	"backend/dto"
	"backend/models"
	"context"
	"fmt"
	"log"
	"math"
	"strings"
	"time"
)

// getCoverageSummaryMapFastInternal 直接在数据库按文件计算覆盖率摘要的内部实现
func (s *CoverageService) getCoverageSummaryMapFastInternal(query dto.CoverageQueryDto) (map[string]interface{}, error) {
	// 1) 读取 Postgres 覆盖率记录（筛选 provider/repo/sha/build/report）
	pgDB := db.GetDB()
	var coverageList []models.Coverage
	coverageQuery := pgDB.Where("provider = ? AND repo_id = ? AND sha = ?",
		query.Provider, query.RepoID, query.SHA)
	if query.BuildProvider != "" {
		coverageQuery = coverageQuery.Where("build_provider = ?", query.BuildProvider)
	}
	if query.BuildID != "" {
		coverageQuery = coverageQuery.Where("build_id = ?", query.BuildID)
	}
	if err := coverageQuery.Find(&coverageList).Error; err != nil {
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}
	if len(coverageList) == 0 {
		return map[string]interface{}{}, nil
	}

	// 2) 读取 relations 获取文件列表（可选 filePath 过滤）
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = coverage.ID
	}
	var relations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}
	relQuery := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", coverageIDs)
	if query.FilePath != "" {
		relQuery = relQuery.Where("file_path = ?", query.FilePath)
	}
	if err := relQuery.Group("coverage_map_hash_id, full_file_path").Find(&relations).Error; err != nil {
		return nil, fmt.Errorf("查询coverageMapRelation失败: %w", err)
	}

	// 3) 从 ClickHouse 直接计算每个文件的 totals
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	// coverage_id 过滤
	covIDs := make([]string, len(coverageList))
	for i, c := range coverageList {
		covIDs[i] = fmt.Sprintf("'%s'", c.ID)
	}

	// 可选文件过滤
	fileFilter := ""
	if query.FilePath != "" {
		fileFilter = fmt.Sprintf(" AND full_file_path = '%s'", strings.ReplaceAll(query.FilePath, "'", "''"))
	}

	// 查询命中（per file）
	hitsSQL := fmt.Sprintf(`
        SELECT
            full_file_path as path,
            tupleElement(sumMapMerge(s), 1) as s_keys,
            tupleElement(sumMapMerge(f), 1) as f_keys,
            tupleElement(sumMapMerge(b), 1) as b_keys
        FROM default.coverage_hit_agg
        WHERE coverage_id IN (%s)%s
        GROUP BY full_file_path
    `, strings.Join(covIDs, ", "), fileFilter)

	hitRows, err := conn.Query(ctx, hitsSQL)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer hitRows.Close()

	type fileHits struct {
		S []interface{}
		F []interface{}
		B []interface{}
	}
	perFileHits := make(map[string]fileHits)
	for hitRows.Next() {
		var (
			path                   string
			sTuple, fTuple, bTuple []interface{}
		)
		if err := hitRows.Scan(&path, &sTuple, &fTuple, &bTuple); err != nil {
			return nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}
		perFileHits[path] = fileHits{S: sTuple, F: fTuple, B: bTuple}
	}

	// 查询映射信息（总数）
	hashSet := make(map[string]struct{})
	for _, r := range relations {
		hashSet[r.CoverageMapHashID] = struct{}{}
	}
	hashList := make([]string, 0, len(hashSet))
	for h := range hashSet {
		hashList = append(hashList, h)
	}
	if len(hashList) == 0 {
		return map[string]interface{}{}, nil
	}

	// 构造查询，计算每个 hash 的 S/F/B 键集或大小（单次查询）
	type mapSizes struct {
		SKeys      []interface{}
		FKeys      []interface{}
		BKeys      []interface{}
		BPathSizes []interface{}
	}
	perHashSizes := make(map[string]mapSizes)

	hashConds := make([]string, len(hashList))
	for i, h := range hashList {
		hashConds[i] = fmt.Sprintf("'%s'", h)
	}
	mapsSQL := fmt.Sprintf(`
        SELECT
            hash,
            mapKeys(statement_map) as s_keys,
            mapKeys(fn_map) as f_keys,
            mapKeys(branch_map) as b_keys,
            arrayMap(x -> length(x.4), mapValues(branch_map)) as b_path_sizes
        FROM coverage_map
        WHERE hash IN (%s)
    `, strings.Join(hashConds, ", "))

	mapRows, err := conn.Query(ctx, mapsSQL)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()

	for mapRows.Next() {
		var (
			hash                            string
			sKeys, fKeys, bKeys, bPathSizes []interface{}
		)
		if err := mapRows.Scan(&hash, &sKeys, &fKeys, &bKeys, &bPathSizes); err != nil {
			return nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}
		perHashSizes[hash] = mapSizes{SKeys: sKeys, FKeys: fKeys, BKeys: bKeys, BPathSizes: bPathSizes}
	}

	// 4) 组装摘要：按文件路径聚合
	result := make(map[string]interface{})
	for _, r := range relations {
		sizes, ok := perHashSizes[r.CoverageMapHashID]
		if !ok {
			continue
		}

		// totals
		totalS := len(sizes.SKeys)
		totalF := len(sizes.FKeys)
		// total branches: sum of path sizes per key
		totalB := 0
		for _, v := range sizes.BPathSizes {
			switch vv := v.(type) {
			case []uint32:
				totalB += len(vv)
			case []interface{}:
				totalB += len(vv)
			}
		}

		// covered counts from perFileHits
		hits := perFileHits[r.FullFilePath]
		coveredS := len(s.convertInterfaceSliceToUint32Slice(hits.S))
		coveredF := len(s.convertInterfaceSliceToUint32Slice(hits.F))
		coveredB := len(s.convertInterfaceSliceToUint32Slice(hits.B))

		// 计算百分比（保留两位小数）
		pct := func(covered, total int) float64 {
			if total == 0 {
				return 100.0
			}
			v := float64(covered) / float64(total) * 100.0
			return math.Round(v*100) / 100
		}

		summary := map[string]interface{}{
			"statements": map[string]interface{}{"total": totalS, "covered": coveredS, "skipped": 0, "pct": pct(coveredS, totalS)},
			"functions":  map[string]interface{}{"total": totalF, "covered": coveredF, "skipped": 0, "pct": pct(coveredF, totalF)},
			"branches":   map[string]interface{}{"total": totalB, "covered": coveredB, "skipped": 0, "pct": pct(coveredB, totalB)},
			"lines":      map[string]interface{}{"total": totalS, "covered": coveredS, "skipped": 0, "pct": pct(coveredS, totalS)},
			"path":       r.FullFilePath,
			"change":     false,
		}
		result[r.FullFilePath] = summary
	}

	// 5) 去掉插桩前缀
	if len(coverageList) > 0 {
		result = s.removeCoverageInstrumentCwd(result, coverageList[0].InstrumentCwd)
	}

	return result, nil
}

// getCoverageSummaryByRepoAndSHAInternal 根据仓库和SHA获取覆盖率摘要的内部实现
func (s *CoverageService) getCoverageSummaryByRepoAndSHAInternal(repoID, sha string) (interface{}, error) {
	start := time.Now()
	mark := func(step string, t0 time.Time) {
		log.Printf("[coverage_overview] %s: %v (since start: %v)", step, time.Since(t0), time.Since(start))
	}
	// 第一步：查询仓库信息
	pgDB := db.GetDB()
	var repo models.Repo
	stepStart := time.Now()
	if err := pgDB.Where("id = ?", repoID).First(&repo).Error; err != nil {
		return nil, fmt.Errorf("查询仓库失败: %w", err)
	}
	mark("step1_query_repo", stepStart)

	// 第二步：查询coverage列表
	var coverageList []models.Coverage
	stepStart = time.Now()
	if err := pgDB.Where("repo_id = ? AND sha = ?", repoID, sha).Find(&coverageList).Error; err != nil {
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}
	mark("step2_query_coverages", stepStart)

	if len(coverageList) == 0 {
		log.Printf("[coverage_overview] total_time: %v (no coverage)", time.Since(start))
		return map[string]interface{}{
			"testCaseInfoList": []interface{}{},
			"buildGroupList":   []map[string]string{},
			"resultList":       []interface{}{},
		}, nil
	}

	// 第三步：获取测试用例信息列表
	stepStart = time.Now()
	testCaseInfoList, err := s.getTestCaseInfoList(coverageList)
	if err != nil {
		return nil, fmt.Errorf("获取测试用例信息失败: %w", err)
	}
	mark("step3_fetch_test_cases", stepStart)

	// 第四步：构建构建组列表
	stepStart = time.Now()
	buildGroupList := s.buildBuildGroupList(coverageList)
	mark("step4_build_group_list", stepStart)

	// 第五步：获取覆盖率映射关系列表
	stepStart = time.Now()
	coverageMapRelationList, err := s.getCoverageMapRelationList(coverageList)
	if err != nil {
		return nil, fmt.Errorf("获取覆盖率映射关系失败: %w", err)
	}
	mark("step5_query_relations", stepStart)

	// 第六步：查询ClickHouse获取摘要数据
	stepStart = time.Now()
	coverageHitData, coverageMapData, err := s.queryClickHouseForSummary(coverageList, coverageMapRelationList)
	if err != nil {
		return nil, fmt.Errorf("查询ClickHouse摘要数据失败: %w", err)
	}
	mark("step6_query_clickhouse", stepStart)

	// 第七步：合并覆盖率映射数据与文件路径
	stepStart = time.Now()
	coverageMapWithFilePath := s.mergeCoverageMapWithFilePath(coverageMapRelationList, coverageMapData)
	mark("step7_merge_map_with_paths", stepStart)

	// 第八步：去重构建组列表
	stepStart = time.Now()
	deduplicatedBuildGroupList := s.deduplicateBuildGroupList(buildGroupList)
	mark("step8_dedupe_build_groups", stepStart)

	// 第九步：构建结果列表
	stepStart = time.Now()
	resultList := s.buildResultList(deduplicatedBuildGroupList, coverageList, coverageHitData, coverageMapWithFilePath, testCaseInfoList)
	mark("step9_build_result_list", stepStart)

	log.Printf("[coverage_overview] total_time: %v", time.Since(start))
	return map[string]interface{}{
		"testCaseInfoList": testCaseInfoList,
		"buildGroupList":   deduplicatedBuildGroupList,
		"resultList":       resultList,
	}, nil
}
