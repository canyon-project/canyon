package services

import (
	"backend/db"
	"backend/dto"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"golang.org/x/sync/errgroup"
)

// CoverageService 覆盖率服务
type CoverageService struct{}

// NewCoverageService 创建覆盖率服务实例
func NewCoverageService() *CoverageService {
	return &CoverageService{}
}

// GetCoverageMap 获取覆盖率映射 - 实现完整的coverage final逻辑
func (s *CoverageService) GetCoverageMap(query dto.CoverageQueryDto) (interface{}, error) {
	// 统一链路日志
	requestID := query.RequestID
	if requestID == "" {
		requestID = utils.GenerateRequestID()
	}
	traceID := requestID
	spanDB := "db-coverage-" + requestID
	spanRel := "relations-" + requestID
	spanCKMap := "ck-map-" + requestID
	spanCKHits := "ck-hits-" + requestID
	spanMerge := "merge-" + requestID

	reqLog := NewRequestLogService()

	// 第一步：查询coverage表，获取所有的coverageID
	pgDB := db.GetDB()
	var coverageList []models.Coverage

	stepStart := time.Now()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 0, requestID, traceID, spanDB, "", "INFO", "query coverage list start", map[string]interface{}{"repoID": query.RepoID, "sha": query.SHA}, nil, query.RepoID, query.SHA, stepStart, time.Now())

	coverageQuery := pgDB.Where("provider = ? AND repo_id = ? AND sha = ?",
		query.Provider, query.RepoID, query.SHA)

	if query.BuildProvider != "" {
		coverageQuery = coverageQuery.Where("build_provider = ?", query.BuildProvider)
	}
	if query.BuildID != "" {
		coverageQuery = coverageQuery.Where("build_id = ?", query.BuildID)
	}

	if err := coverageQuery.Find(&coverageList).Error; err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 500, requestID, traceID, spanDB, "", "ERROR", "query coverage list failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, stepStart, time.Now())
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}

	if len(coverageList) == 0 {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 200, requestID, traceID, spanDB, "", "INFO", "no coverage found", nil, nil, query.RepoID, query.SHA, stepStart, time.Now())
		return map[string]interface{}{}, nil
	}

	// 第二步：查询coverageMapRelation，获取coverage_map的hash
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = coverage.ID
	}

	var coverageMapRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}

	relationQuery := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", coverageIDs)

	if query.FilePath != "" {
		relationQuery = relationQuery.Where("file_path = ?", query.FilePath)
	}

	relStart := time.Now()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 0, requestID, traceID, spanRel, spanDB, "INFO", "query relations start", map[string]interface{}{"coverageIDs": len(coverageIDs)}, nil, query.RepoID, query.SHA, relStart, time.Now())
	if err := relationQuery.Group("coverage_map_hash_id, full_file_path").
		Find(&coverageMapRelations).Error; err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 500, requestID, traceID, spanRel, spanDB, "ERROR", "query relations failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, relStart, time.Now())
		return nil, fmt.Errorf("查询coverageMapRelation失败: %w", err)
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 200, requestID, traceID, spanRel, spanDB, "INFO", "relations fetched", map[string]interface{}{"relations": len(coverageMapRelations)}, nil, query.RepoID, query.SHA, relStart, time.Now())

	// 第三步：并行查询ClickHouse
	ckStart := time.Now()
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 0, requestID, traceID, spanCKMap, spanRel, "INFO", "clickhouse map query start", map[string]interface{}{"hashes": len(coverageMapRelations)}, nil, query.RepoID, query.SHA, ckStart, time.Now())
	coverageMapResult, coverageHitResult, err := s.queryClickHouseData(
		coverageMapRelations, coverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 500, requestID, traceID, spanCKMap, spanRel, "ERROR", "clickhouse map/hit query failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, query.SHA, ckStart, time.Now())
		return nil, err
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 200, requestID, traceID, spanCKHits, spanCKMap, "INFO", "clickhouse results fetched", map[string]interface{}{"map": len(coverageMapResult), "hits": len(coverageHitResult)}, nil, query.RepoID, query.SHA, ckStart, time.Now())

	// 第四步：合并数据
	mergeStart := time.Now()
	result := s.mergeCoverageMapAndHitResults(coverageMapResult, coverageHitResult, coverageMapRelations)
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map", "GET", 200, requestID, traceID, spanMerge, spanCKHits, "INFO", "merge results done", map[string]interface{}{"relations": len(coverageMapRelations)}, nil, query.RepoID, query.SHA, mergeStart, time.Now())

	// 第五步：移除instrumentCwd路径
	if len(coverageList) > 0 {
		result = s.removeCoverageInstrumentCwd(result, coverageList[0].InstrumentCwd)
	}

	return result, nil
}

// GetCoverageSummaryMapFast 直接在数据库按文件计算覆盖率摘要（深度优化版）
// 返回结构为 map[path] -> { lines/statements/branches/functions/... }
func (s *CoverageService) GetCoverageSummaryMapFast(query dto.CoverageQueryDto) (map[string]interface{}, error) {
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
	// - 语句总数：mapKeys(statement_map) 数量
	// - 语句覆盖数：sumMapMerge(s) 的非零键数量
	// - 函数总数/覆盖数：同理
	// - 分支总数：对 branch_map 每个键的 paths 长度累加
	// - 分支覆盖数：sumMapMerge(b) 展开后计数
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
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
	// 取 relations 关联到的 hash 列表
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
	// 构造查询，计算每个 hash 的 S/F/B 键集或大小
	// 我们只需要 mapKeys 的数量与 branch paths 数量
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

	type mapSizes struct {
		SKeys      []interface{}
		FKeys      []interface{}
		BKeys      []interface{}
		BPathSizes []interface{}
	}
	perHashSizes := make(map[string]mapSizes)
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

	// 4) 组装摘要：按文件路径聚合（依据 relations path -> hash）
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

		// 计算百分比
		pct := func(covered, total int) float64 {
			if total == 0 {
				return 100.0
			}
			return float64(covered) / float64(total) * 100.0
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

	// 5) 去掉插桩前缀（与旧逻辑一致）
	if len(coverageList) > 0 {
		result = s.removeCoverageInstrumentCwd(result, coverageList[0].InstrumentCwd)
	}

	return result, nil
}

// queryClickHouseData 查询ClickHouse数据
func (s *CoverageService) queryClickHouseData(
	coverageMapRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
	coverageList []models.Coverage,
	reportProvider, reportID string,
) ([]models.CoverageMapQueryResult, []models.CoverageHitQueryResult, error) {

	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 构建hash列表
	hashList := make([]string, len(coverageMapRelations))
	for i, relation := range coverageMapRelations {
		hashList[i] = relation.CoverageMapHashID
	}

	var (
		coverageMapResult []models.CoverageMapQueryResult
		coverageHitResult []models.CoverageHitQueryResult
	)

	g, gctx := errgroup.WithContext(ctx)

	// 并行查询 coverage_map
	g.Go(func() error {
		coverageMapQuery := s.buildCoverageMapQuery(hashList)
		mapRows, err := conn.Query(gctx, coverageMapQuery)
		if err != nil {
			return fmt.Errorf("查询coverage_map失败: %w", err)
		}
		defer mapRows.Close()

		for mapRows.Next() {
			var result models.CoverageMapQueryResult
			var (
				statementMap           map[uint32][]interface{}
				fnMapStr, branchMapStr string
			)

			if err := mapRows.Scan(
				&statementMap,
				&fnMapStr,
				&branchMapStr,
				&result.CoverageMapHashID,
			); err != nil {
				return fmt.Errorf("扫描coverage_map数据失败: %w", err)
			}

			// 解析数据（不再使用 restore* 字段）
			result.StatementMap = utils.ConvertStatementMap(statementMap)
			result.FnMap = utils.ParseFunctionMapSimple(fnMapStr)
			result.BranchMap = utils.ParseBranchMapSimple(branchMapStr)

			coverageMapResult = append(coverageMapResult, result)
		}
		return nil
	})

	// 并行查询 coverage_hit_agg
	g.Go(func() error {
		coverageHitQuery := s.buildCoverageHitQuery(coverageList, reportProvider, reportID)
		hitRows, err := conn.Query(gctx, coverageHitQuery)
		if err != nil {
			return fmt.Errorf("查询coverage_hit_agg失败: %w", err)
		}
		defer hitRows.Close()

		for hitRows.Next() {
			var (
				fullFilePath           string
				sTuple, fTuple, bTuple []interface{}
			)
			if err := hitRows.Scan(
				&fullFilePath,
				&sTuple,
				&fTuple,
				&bTuple,
			); err != nil {
				return fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
			}

			// 转换tuple slice为uint32 map
			result := models.CoverageHitQueryResult{
				FullFilePath: fullFilePath,
				S:            s.convertTupleSliceToUint32Map(sTuple),
				F:            s.convertTupleSliceToUint32Map(fTuple),
				B:            s.convertTupleSliceToUint32Map(bTuple),
			}
			coverageHitResult = append(coverageHitResult, result)
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, nil, err
	}

	return coverageMapResult, coverageHitResult, nil
}

// queryHitPerCoverage 按coverage_id与文件路径查询ClickHouse的S/F/B命中数据
func (s *CoverageService) queryHitPerCoverage(
	coverageList []models.Coverage,
	reportProvider, reportID string,
) ([]models.CoverageHitSummaryResult, error) {
	// 过滤coverage（与buildCoverageHitQuery一致的过滤逻辑）
	var filteredCoverages []models.Coverage
	for _, coverage := range coverageList {
		reportProviderOff := reportProvider == "" || coverage.ReportProvider == reportProvider
		reportIDOff := reportID == "" || coverage.ReportID == reportID
		if reportProviderOff && reportIDOff {
			filteredCoverages = append(filteredCoverages, coverage)
		}
	}

	if len(filteredCoverages) == 0 {
		return []models.CoverageHitSummaryResult{}, nil
	}

	// 构建IN条件
	coverageIDs := make([]string, len(filteredCoverages))
	for i, coverage := range filteredCoverages {
		coverageIDs[i] = fmt.Sprintf("'%s'", coverage.ID)
	}

	query := fmt.Sprintf(`
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

	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	rows, err := conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer rows.Close()

	var results []models.CoverageHitSummaryResult
	for rows.Next() {
		var (
			coverageID, fullFilePath string
			sTuple, fTuple, bTuple   []interface{}
		)

		if err := rows.Scan(&coverageID, &fullFilePath, &sTuple, &fTuple, &bTuple); err != nil {
			return nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		results = append(results, models.CoverageHitSummaryResult{
			CoverageID:   coverageID,
			FullFilePath: fullFilePath,
			S:            s.convertTupleSliceToUint32Map(sTuple),
			F:            s.convertTupleSliceToUint32Map(fTuple),
			B:            s.convertTupleSliceToUint32Map(bTuple),
		})
	}

	return results, nil
}

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

// mergeCoverageMapAndHitResults 合并coverage_map和coverage_hit结果
func (s *CoverageService) mergeCoverageMapAndHitResults(
	coverageMapResult []models.CoverageMapQueryResult,
	coverageHitResult []models.CoverageHitQueryResult,
	coverageMapRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
) map[string]interface{} {
	result := make(map[string]interface{})

	// 为每个coverage_map结果添加fullFilePath并合并hit数据
	for _, mapItem := range coverageMapResult {
		// 找到对应的fullFilePath
		var fullFilePath string
		for _, relation := range coverageMapRelations {
			if relation.CoverageMapHashID == mapItem.CoverageMapHashID {
				fullFilePath = relation.FullFilePath
				break
			}
		}

		if fullFilePath == "" {
			continue
		}

		// 找到对应的hit数据
		var hitItem *models.CoverageHitQueryResult
		for _, hit := range coverageHitResult {
			if hit.FullFilePath == fullFilePath {
				hitItem = &hit
				break
			}
		}

		// 转换为Istanbul格式
		istanbulStatementMap := s.convertToIstanbulStatementMap(mapItem.StatementMap)
		istanbulFnMap := s.convertToIstanbulFnMap(mapItem.FnMap)
		istanbulBranchMap := s.convertToIstanbulBranchMap(mapItem.BranchMap)

		// 构建Istanbul格式的文件覆盖率数据
		fileCoverageItem := map[string]interface{}{
			"path":         fullFilePath,
			"statementMap": istanbulStatementMap,
			"fnMap":        istanbulFnMap,
			"branchMap":    istanbulBranchMap,
		}

		// 添加覆盖率计数，按索引排序并填充缺失数据
		var hitData map[uint32]uint32
		if hitItem != nil {
			hitData = hitItem.S
		} else {
			hitData = make(map[uint32]uint32)
		}
		fileCoverageItem["s"] = s.buildOrderedHitMap(mapItem.StatementMap, hitData)

		if hitItem != nil {
			hitData = hitItem.F
		} else {
			hitData = make(map[uint32]uint32)
		}
		fileCoverageItem["f"] = s.buildOrderedHitMap(mapItem.FnMap, hitData)

		if hitItem != nil {
			fileCoverageItem["b"] = s.buildOrderedBranchHitMap(mapItem.BranchMap, hitItem.B)
		} else {
			fileCoverageItem["b"] = s.buildOrderedBranchHitMap(mapItem.BranchMap, make(map[uint32]uint32))
		}

		result[fullFilePath] = fileCoverageItem
	}

	return result
}

// convertToIstanbulStatementMap 转换为Istanbul格式的statementMap
func (s *CoverageService) convertToIstanbulStatementMap(statementMap map[uint32]models.StatementInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range statementMap {
		keys = append(keys, key)
	}

	// 排序keys
	for i := 0; i < len(keys); i++ {
		for j := i + 1; j < len(keys); j++ {
			if keys[i] > keys[j] {
				keys[i], keys[j] = keys[j], keys[i]
			}
		}
	}

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		stmt := statementMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		// 转换line和column，0值转为null
		// 现在 StatementInfo 直接存储了起始和结束位置
		startLine := s.convertZeroToNull(stmt.StartLine)
		startColumn := s.convertZeroToNull(stmt.StartColumn)
		endLine := s.convertZeroToNull(stmt.EndLine)
		endColumn := s.convertZeroToNull(stmt.EndColumn)

		result.Values[keyStr] = map[string]interface{}{
			"start": map[string]interface{}{
				"line":   startLine,
				"column": startColumn,
			},
			"end": map[string]interface{}{
				"line":   endLine,
				"column": endColumn,
			},
		}
	}

	return result
}

// convertToIstanbulFnMap 转换为Istanbul格式的fnMap
func (s *CoverageService) convertToIstanbulFnMap(fnMap map[uint32]models.FunctionInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range fnMap {
		keys = append(keys, key)
	}

	// 排序keys
	for i := 0; i < len(keys); i++ {
		for j := i + 1; j < len(keys); j++ {
			if keys[i] > keys[j] {
				keys[i], keys[j] = keys[j], keys[i]
			}
		}
	}

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		fn := fnMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		result.Values[keyStr] = map[string]interface{}{
			"name": fn.Name,
			"line": s.convertZeroToNull(fn.Line),
			"decl": map[string]interface{}{
				"start": map[string]interface{}{
					"line":   s.convertZeroToNull(fn.StartPos[0]),
					"column": s.convertZeroToNull(fn.StartPos[1]),
				},
				"end": map[string]interface{}{
					"line":   s.convertZeroToNull(fn.StartPos[2]),
					"column": s.convertZeroToNull(fn.StartPos[3]),
				},
			},
			"loc": map[string]interface{}{
				"start": map[string]interface{}{
					"line":   s.convertZeroToNull(fn.EndPos[0]),
					"column": s.convertZeroToNull(fn.EndPos[1]),
				},
				"end": map[string]interface{}{
					"line":   s.convertZeroToNull(fn.EndPos[2]),
					"column": s.convertZeroToNull(fn.EndPos[3]),
				},
			},
		}
	}

	return result
}

// getBranchTypeByIndex 根据索引返回对应的分支类型
// 对应 JavaScript 中的 getBranchTypeByIndex 函数
func (s *CoverageService) getBranchTypeByIndex(index uint8) string {
	switch index {
	case 1:
		return "if"
	case 2:
		return "binary-expr"
	case 3:
		return "cond-expr"
	case 4:
		return "switch"
	case 5:
		return "default-arg"
	default:
		return "unknown"
	}
}

// convertToIstanbulBranchMap 转换为Istanbul格式的branchMap
func (s *CoverageService) convertToIstanbulBranchMap(branchMap map[uint32]models.BranchInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range branchMap {
		keys = append(keys, key)
	}

	// 排序keys
	for i := 0; i < len(keys); i++ {
		for j := i + 1; j < len(keys); j++ {
			if keys[i] > keys[j] {
				keys[i], keys[j] = keys[j], keys[i]
			}
		}
	}

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		branch := branchMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		// 转换locations
		locations := make([]map[string]interface{}, len(branch.Paths))
		for j, path := range branch.Paths {
			locations[j] = map[string]interface{}{
				"start": map[string]interface{}{
					"line":   s.convertZeroToNull(path[0]),
					"column": s.convertZeroToNull(path[1]),
				},
				"end": map[string]interface{}{
					"line":   s.convertZeroToNull(path[2]),
					"column": s.convertZeroToNull(path[3]),
				},
			}
		}

		// 使用正确的分支类型映射
		branchType := s.getBranchTypeByIndex(branch.Type)

		result.Values[keyStr] = map[string]interface{}{
			"type": branchType,
			"line": s.convertZeroToNull(branch.Line),
			"loc": map[string]interface{}{
				"start": map[string]interface{}{
					"line":   s.convertZeroToNull(branch.Position[0]),
					"column": s.convertZeroToNull(branch.Position[1]),
				},
				"end": map[string]interface{}{
					"line":   s.convertZeroToNull(branch.Position[2]),
					"column": s.convertZeroToNull(branch.Position[3]),
				},
			},
			"locations": locations,
		}
	}

	return result
}

// convertBranchHits 转换分支覆盖率计数
func (s *CoverageService) convertBranchHits(branchHits map[uint32]uint32, branchMap map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	for keyStr, branchInfo := range branchMap {
		if branch, ok := branchInfo.(map[string]interface{}); ok {
			if locations, ok := branch["locations"].([]map[string]interface{}); ok {
				// 为每个分支路径创建计数数组
				counts := make([]uint32, len(locations))

				// 从branchHits中获取计数
				if key, err := strconv.ParseUint(keyStr, 10, 32); err == nil {
					if hitCount, exists := branchHits[uint32(key)]; exists {
						// 简化处理：将hit计数分配给第一个路径
						if len(counts) > 0 {
							counts[0] = hitCount
						}
					}
				}

				result[keyStr] = counts
			}
		}
	}

	return result
}

// initializeStatementHits 初始化语句覆盖率计数为0
func (s *CoverageService) initializeStatementHits(statementMap map[string]interface{}) map[string]uint32 {
	result := make(map[string]uint32)
	for key := range statementMap {
		result[key] = 0
	}
	return result
}

// initializeFunctionHits 初始化函数覆盖率计数为0
func (s *CoverageService) initializeFunctionHits(fnMap map[string]interface{}) map[string]uint32 {
	result := make(map[string]uint32)
	for key := range fnMap {
		result[key] = 0
	}
	return result
}

// initializeBranchHits 初始化分支覆盖率计数为0
func (s *CoverageService) initializeBranchHits(branchMap map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for keyStr, branchInfo := range branchMap {
		if branch, ok := branchInfo.(map[string]interface{}); ok {
			if locations, ok := branch["locations"].([]map[string]interface{}); ok {
				counts := make([]uint32, len(locations))
				result[keyStr] = counts
			}
		}
	}
	return result
}

// convertZeroToNull 将0值转换为null，非0值保持原值
func (s *CoverageService) convertZeroToNull(value uint32) interface{} {
	if value == 0 {
		return nil
	}
	return value
}

// convertTupleSliceToUint32Map 将ClickHouse tuple slice转换为uint32 map
// tuple格式: [keys_array, values_array]
func (s *CoverageService) convertTupleSliceToUint32Map(tupleSlice []interface{}) map[uint32]uint32 {
	result := make(map[uint32]uint32)

	if len(tupleSlice) != 2 {
		return result
	}

	// 尝试不同的类型转换
	var keys []uint32
	var values []uint64

	// 处理keys
	switch k := tupleSlice[0].(type) {
	case []uint32:
		keys = k
	case []interface{}:
		keys = make([]uint32, len(k))
		for i, v := range k {
			if val, ok := v.(uint32); ok {
				keys[i] = val
			}
		}
	default:
		return result
	}

	// 处理values
	switch v := tupleSlice[1].(type) {
	case []uint64:
		values = v
	case []uint32:
		values = make([]uint64, len(v))
		for i, val := range v {
			values[i] = uint64(val)
		}
	case []interface{}:
		values = make([]uint64, len(v))
		for i, val := range v {
			switch vVal := val.(type) {
			case uint64:
				values[i] = vVal
			case uint32:
				values[i] = uint64(vVal)
			case int64:
				values[i] = uint64(vVal)
			case int32:
				values[i] = uint64(vVal)
			case int:
				values[i] = uint64(vVal)
			}
		}
	default:
		return result
	}

	// 确保keys和values长度一致
	minLen := len(keys)
	if len(values) < minLen {
		minLen = len(values)
	}

	// 转换为map
	for i := 0; i < minLen; i++ {
		result[keys[i]] = uint32(values[i])
	}

	return result
}

// OrderedMap 有序map结构，用于保持JSON序列化时的顺序
type OrderedMap struct {
	Keys   []string
	Values map[string]uint32
}

// MarshalJSON 自定义JSON序列化，保持key的顺序
func (om OrderedMap) MarshalJSON() ([]byte, error) {
	// 对keys进行数字排序
	sortedKeys := make([]string, len(om.Keys))
	copy(sortedKeys, om.Keys)

	// 使用数字排序而不是字符串排序
	for i := 0; i < len(sortedKeys); i++ {
		for j := i + 1; j < len(sortedKeys); j++ {
			keyI, _ := strconv.Atoi(sortedKeys[i])
			keyJ, _ := strconv.Atoi(sortedKeys[j])
			if keyI > keyJ {
				sortedKeys[i], sortedKeys[j] = sortedKeys[j], sortedKeys[i]
			}
		}
	}

	result := "{"
	for i, key := range sortedKeys {
		if i > 0 {
			result += ","
		}
		result += fmt.Sprintf("\"%s\":%d", key, om.Values[key])
	}
	result += "}"
	return []byte(result), nil
}

// OrderedInterfaceMap 有序interface map结构，用于保持JSON序列化时的顺序
type OrderedInterfaceMap struct {
	Keys   []string
	Values map[string]interface{}
}

// MarshalJSON 自定义JSON序列化，保持key的顺序
func (om OrderedInterfaceMap) MarshalJSON() ([]byte, error) {
	// 对keys进行数字排序
	sortedKeys := make([]string, len(om.Keys))
	copy(sortedKeys, om.Keys)

	// 使用数字排序而不是字符串排序
	for i := 0; i < len(sortedKeys); i++ {
		for j := i + 1; j < len(sortedKeys); j++ {
			keyI, _ := strconv.Atoi(sortedKeys[i])
			keyJ, _ := strconv.Atoi(sortedKeys[j])
			if keyI > keyJ {
				sortedKeys[i], sortedKeys[j] = sortedKeys[j], sortedKeys[i]
			}
		}
	}

	result := "{"
	for i, key := range sortedKeys {
		if i > 0 {
			result += ","
		}
		valueBytes, err := json.Marshal(om.Values[key])
		if err != nil {
			return nil, err
		}
		result += fmt.Sprintf("\"%s\":%s", key, string(valueBytes))
	}
	result += "}"
	return []byte(result), nil
}

// buildOrderedHitMap 构建有序的hit map，按索引排序并填充缺失数据
func (s *CoverageService) buildOrderedHitMap(mapData interface{}, hitData map[uint32]uint32) OrderedMap {
	// 获取所有的索引
	var indices []uint32
	switch m := mapData.(type) {
	case map[uint32]models.StatementInfo:
		for key := range m {
			indices = append(indices, key)
		}
	case map[uint32]models.FunctionInfo:
		for key := range m {
			indices = append(indices, key)
		}
	default:
		return OrderedMap{Keys: []string{}, Values: make(map[string]uint32)}
	}

	// 排序索引
	for i := 0; i < len(indices); i++ {
		for j := i + 1; j < len(indices); j++ {
			if indices[i] > indices[j] {
				indices[i], indices[j] = indices[j], indices[i]
			}
		}
	}

	// 构建有序map
	orderedMap := OrderedMap{
		Keys:   make([]string, len(indices)),
		Values: make(map[string]uint32),
	}

	for i, index := range indices {
		keyStr := fmt.Sprintf("%d", index)
		orderedMap.Keys[i] = keyStr

		if hitCount, exists := hitData[index]; exists {
			orderedMap.Values[keyStr] = hitCount
		} else {
			orderedMap.Values[keyStr] = 0
		}
	}

	return orderedMap
}

// decodeKey 解码分支键，将编码的键解码为 branchId 和 branchLength
// 对应 JavaScript 中的 decodeKey 函数
func (s *CoverageService) decodeKey(encodedKey uint32) (uint32, uint32) {
	const maxBranchLength = 10000 // 每个分支的最大长度
	branchId := encodedKey / maxBranchLength
	branchLength := encodedKey % maxBranchLength
	return branchId, branchLength
}

// buildOrderedBranchHitMap 构建有序的分支hit map
// 对应 JavaScript 中的 transformB 函数逻辑
func (s *CoverageService) buildOrderedBranchHitMap(branchMap map[uint32]models.BranchInfo, hitData map[uint32]uint32) OrderedInterfaceMap {
	// 首先处理hitData，将编码的键解码为分支结构
	decodedHitData := make(map[uint32][]uint32)

	// 解码hitData中的键
	for encodedKey, hitCount := range hitData {
		branchId, branchLength := s.decodeKey(encodedKey)

		if decodedHitData[branchId] == nil {
			decodedHitData[branchId] = make([]uint32, 0)
		}

		// 确保数组足够大
		for len(decodedHitData[branchId]) <= int(branchLength) {
			decodedHitData[branchId] = append(decodedHitData[branchId], 0)
		}

		decodedHitData[branchId][branchLength] = hitCount
	}

	// 获取所有的分支索引并排序
	var indices []uint32
	for key := range branchMap {
		indices = append(indices, key)
	}

	// 排序索引
	for i := 0; i < len(indices); i++ {
		for j := i + 1; j < len(indices); j++ {
			if indices[i] > indices[j] {
				indices[i], indices[j] = indices[j], indices[i]
			}
		}
	}

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(indices)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的索引构建结果
	for i, index := range indices {
		keyStr := fmt.Sprintf("%d", index)
		result.Keys[i] = keyStr
		branch := branchMap[index]

		// 为每个分支路径创建计数数组
		pathCount := len(branch.Paths)
		if pathCount == 0 {
			pathCount = 2 // 默认至少有2个分支路径
		}

		counts := make([]uint32, pathCount)

		// 从解码后的hitData中获取计数
		if branchHits, exists := decodedHitData[index]; exists {
			// 复制计数数据，确保不超出数组边界
			for j := 0; j < len(counts) && j < len(branchHits); j++ {
				counts[j] = branchHits[j]
			}
		}

		result.Values[keyStr] = counts
	}

	return result
}

// removeCoverageInstrumentCwd 移除覆盖率路径中的instrumentCwd
func (s *CoverageService) removeCoverageInstrumentCwd(
	result map[string]interface{},
	instrumentCwd string,
) map[string]interface{} {
	if instrumentCwd == "" {
		return result
	}

	newResult := make(map[string]interface{})
	for filePath, coverage := range result {
		// 移除instrumentCwd前缀
		newPath := strings.TrimPrefix(filePath, instrumentCwd)
		newPath = strings.TrimPrefix(newPath, "/")

		// 更新coverage中的path字段
		if coverageMap, ok := coverage.(map[string]interface{}); ok {
			coverageMap["path"] = newPath
			newResult[newPath] = coverageMap
		} else {
			newResult[newPath] = coverage
		}
	}

	return newResult
}

// GetCoverageSummaryByRepoAndSHA 根据仓库和SHA获取覆盖率摘要 - 对应TypeScript服务的invoke方法
func (s *CoverageService) GetCoverageSummaryByRepoAndSHA(repoID, sha string) (interface{}, error) {
	// 第一步：查询仓库信息
	pgDB := db.GetDB()
	var repo models.Repo
	if err := pgDB.Where("id = ?", repoID).First(&repo).Error; err != nil {
		return nil, fmt.Errorf("查询仓库失败: %w", err)
	}

	// 第二步：查询覆盖率列表
	var coverageList []models.Coverage
	if err := pgDB.Where("repo_id = ? AND sha = ?", repoID, sha).Find(&coverageList).Error; err != nil {
		return nil, fmt.Errorf("查询覆盖率列表失败: %w", err)
	}

	if len(coverageList) == 0 {
		return []interface{}{}, nil
	}

	// 第三步：获取测试用例信息（对应TypeScript中的testCaseInfoList）
	testCaseInfoList, err := s.getTestCaseInfoList(coverageList)
	if err != nil {
		// 测试用例信息获取失败不影响主要功能，记录日志但继续执行
	}

	// 第四步：构建构建组列表
	buildGroupList := s.buildBuildGroupList(coverageList)

	// 第五步：查询coverageMapRelation
	coverageMapRelationList, err := s.getCoverageMapRelationList(coverageList)
	if err != nil {
		return nil, err
	}

	// 第六步：去重hash ID列表
	deduplicateHashIDList := s.deduplicateHashIDList(coverageMapRelationList)

	// 第七步：查询ClickHouse数据 - 完全按照老流程
	coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJson, err := s.queryClickHouseDataOldWay(coverageList, deduplicateHashIDList)
	if err != nil {
		return nil, err
	}

	// 第八步：合并coverage map与file path - 按照老流程
	coverageMapQuerySqlResultJsonWidth := s.mergeCoverageMapWithFilePathOldWay(coverageMapRelationList, coverageMapQuerySqlResultJson)

	// 第九步：去重构建组列表
	deduplicatedBuildGroupList := s.deduplicateBuildGroupList(buildGroupList)

	// 第十步：构建结果列表 - 完全按照老流程
	resultList := s.buildResultListOldWay(
		deduplicatedBuildGroupList,
		coverageList,
		coverageHitQuerySqlResultJson,
		coverageMapQuerySqlResultJsonWidth,
		testCaseInfoList,
	)

	return resultList, nil
}

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
			sTuple                   []interface{}
		)
		err := hitRows.Scan(
			&coverageID,
			&fullFilePath,
			&sTuple,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		// 转换tuple slice为uint32 map - 使用与老流程相同的逻辑
		result := models.CoverageHitSummaryResult{
			CoverageID:   coverageID,
			FullFilePath: fullFilePath,
			S:            s.convertTupleSliceToUint32Map(sTuple),
			F:            make(map[uint32]uint32), // 暂时为空，与老流程一致
			B:            make(map[uint32]uint32), // 暂时为空，与老流程一致
		}
		coverageHitData = append(coverageHitData, result)
	}

	// 查询coverage_map - 使用与现有方法相同的查询格式
	hashList := make([]string, 0)
	hashSet := make(map[string]bool)
	for _, relation := range coverageMapRelationList {
		if !hashSet[relation.CoverageMapHashID] {
			hashSet[relation.CoverageMapHashID] = true
			hashList = append(hashList, relation.CoverageMapHashID)
		}
	}

	if len(hashList) == 0 {
		return coverageHitData, []models.CoverageMapSummaryResult{}, nil
	}

	coverageMapQuery := s.buildCoverageMapQuery(hashList)
	mapRows, err := conn.Query(ctx, coverageMapQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()

	var coverageMapData []models.CoverageMapSummaryResult
	for mapRows.Next() {
		var result models.CoverageMapSummaryResult
		var (
			sKeys, fKeys, bKeys []interface{}
		)

		err := mapRows.Scan(
			&result.Hash,
			&sKeys,
			&fKeys,
			&bKeys,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}

		// 使用与老流程相同的解析逻辑
		result.S = s.convertInterfaceSliceToUint32Slice(sKeys)
		result.F = s.convertInterfaceSliceToUint32Slice(fKeys)
		result.B = s.convertInterfaceSliceToUint32Slice(bKeys)
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

// getTestCaseInfo 获取测试用例信息
func (s *CoverageService) getTestCaseInfo(testCaseInfoList []interface{}, reportID, reportProvider string) map[string]interface{} {
	for _, item := range testCaseInfoList {
		if info, ok := item.(map[string]interface{}); ok {
			if info["reportID"] == reportID && info["reportProvider"] == reportProvider {
				return info
			}
		}
	}

	// 返回默认信息
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

// buildCoverageHitQueryWithCoverageID 构建包含coverage_id的coverage_hit_agg查询SQL
func (s *CoverageService) buildCoverageHitQueryWithCoverageID(coverageList []models.Coverage) string {
	if len(coverageList) == 0 {
		return `SELECT '' as coverageID, '' as fullFilePath, [] as s WHERE 1=0`
	}

	// 构建IN条件
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = fmt.Sprintf("'%s'", coverage.ID)
	}

	return fmt.Sprintf(`
		SELECT
			coverage_id as coverageID,
			full_file_path as fullFilePath,
			tupleElement(sumMapMerge(s), 1) AS s
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
		SELECT
			hash,
			mapKeys(statement_map) AS s,
			mapKeys(fn_map) AS f,
			mapKeys(branch_map) AS b
		FROM coverage_map
		WHERE hash IN (%s)
	`, strings.Join(hashConditions, ", "))
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

// convertInterfaceSliceToUint32Slice 将interface slice转换为uint32 slice
func (s *CoverageService) convertInterfaceSliceToUint32Slice(input []interface{}) []uint32 {
	var result []uint32
	for _, item := range input {
		switch v := item.(type) {
		case uint32:
			result = append(result, v)
		case uint64:
			result = append(result, uint32(v))
		case int:
			result = append(result, uint32(v))
		case int64:
			result = append(result, uint32(v))
		}
	}
	return result
}

// deduplicateHashIDList 去重hash ID列表 - 按照老流程
func (s *CoverageService) deduplicateHashIDList(coverageMapRelationList []struct {
	CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
	FullFilePath      string `gorm:"column:full_file_path"`
}) []string {
	hashSet := make(map[string]bool)
	var result []string

	for _, relation := range coverageMapRelationList {
		if !hashSet[relation.CoverageMapHashID] {
			hashSet[relation.CoverageMapHashID] = true
			result = append(result, relation.CoverageMapHashID)
		}
	}

	return result
}

// queryClickHouseDataOldWay 按照老流程查询ClickHouse数据
func (s *CoverageService) queryClickHouseDataOldWay(coverageList []models.Coverage, deduplicateHashIDList []string) ([]map[string]interface{}, []map[string]interface{}, error) {
	// 构建coverage_id列表
	coverageIDs := make([]string, len(coverageList))
	for i, coverage := range coverageList {
		coverageIDs[i] = fmt.Sprintf("'%s'", coverage.ID)
	}

	// 构建hash列表
	hashConditions := make([]string, len(deduplicateHashIDList))
	for i, hash := range deduplicateHashIDList {
		hashConditions[i] = fmt.Sprintf("'%s'", hash)
	}

	// 查询coverage_hit_agg - 完全按照老流程
	coverageHitQuery := fmt.Sprintf(`
		SELECT
			coverage_id as coverageID,
			full_file_path as fullFilePath,
			tupleElement(sumMapMerge(s), 1) AS s
		FROM default.coverage_hit_agg
		WHERE coverage_id IN (%s)
		GROUP BY coverage_id, full_file_path
	`, strings.Join(coverageIDs, ", "))

	// 查询coverage_map - 完全按照老流程
	coverageMapQuery := fmt.Sprintf(`
		SELECT
			hash,
			mapKeys(statement_map) AS s,
			mapKeys(fn_map) AS f,
			mapKeys(branch_map) AS b
		FROM coverage_map
		WHERE hash IN (%s)
	`, strings.Join(hashConditions, ", "))

	// 执行查询
	ckDB := db.GetClickHouseDB()

	// 查询coverage_hit_agg
	hitRows, err := ckDB.Query(context.Background(), coverageHitQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer hitRows.Close()

	var coverageHitQuerySqlResultJson []map[string]interface{}
	for hitRows.Next() {
		var coverageID, fullFilePath string
		var sTuple []interface{}

		err := hitRows.Scan(&coverageID, &fullFilePath, &sTuple)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		// 转换tuple slice为uint32 slice
		sKeys := s.convertInterfaceSliceToUint32Slice(sTuple)

		result := map[string]interface{}{
			"coverageID":   coverageID,
			"fullFilePath": fullFilePath,
			"s":            sKeys,
		}
		coverageHitQuerySqlResultJson = append(coverageHitQuerySqlResultJson, result)
	}

	// 查询coverage_map
	mapRows, err := ckDB.Query(context.Background(), coverageMapQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()

	var coverageMapQuerySqlResultJson []map[string]interface{}
	for mapRows.Next() {
		var hash string
		var sKeys, fKeys, bKeys []interface{}

		err := mapRows.Scan(&hash, &sKeys, &fKeys, &bKeys)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}

		result := map[string]interface{}{
			"hash": hash,
			"s":    s.convertInterfaceSliceToUint32Slice(sKeys),
			"f":    s.convertInterfaceSliceToUint32Slice(fKeys),
			"b":    s.convertInterfaceSliceToUint32Slice(bKeys),
		}
		coverageMapQuerySqlResultJson = append(coverageMapQuerySqlResultJson, result)
	}

	return coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJson, nil
}

// mergeCoverageMapWithFilePathOldWay 按照老流程合并coverage map与file path
func (s *CoverageService) mergeCoverageMapWithFilePathOldWay(
	coverageMapRelationList []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
	coverageMapQuerySqlResultJson []map[string]interface{},
) []map[string]interface{} {
	var coverageMapQuerySqlResultJsonWidth []map[string]interface{}

	for _, coverageMapRelationItem := range coverageMapRelationList {
		// 找到对应的coverage map数据
		var coverageMapQuerySqlResultJsonItem map[string]interface{}
		for _, item := range coverageMapQuerySqlResultJson {
			if item["hash"] == coverageMapRelationItem.CoverageMapHashID {
				coverageMapQuerySqlResultJsonItem = item
				break
			}
		}

		if coverageMapQuerySqlResultJsonItem != nil {
			// 复制数据并添加fullFilePath
			result := make(map[string]interface{})
			for k, v := range coverageMapQuerySqlResultJsonItem {
				result[k] = v
			}
			result["fullFilePath"] = coverageMapRelationItem.FullFilePath
			coverageMapQuerySqlResultJsonWidth = append(coverageMapQuerySqlResultJsonWidth, result)
		}
	}

	return coverageMapQuerySqlResultJsonWidth
}

// buildResultListOldWay 按照老流程构建结果列表
func (s *CoverageService) buildResultListOldWay(
	deduplicatedBuildGroupList []map[string]string,
	coverageList []models.Coverage,
	coverageHitQuerySqlResultJson []map[string]interface{},
	coverageMapQuerySqlResultJsonWidth []map[string]interface{},
	testCaseInfoList []interface{},
) []interface{} {
	var resultList []interface{}

	for _, buildGroup := range deduplicatedBuildGroupList {
		buildID := buildGroup["buildID"]
		buildProvider := buildGroup["buildProvider"]

		// 过滤当前build group的coverage
		var currentCoverageList []models.Coverage
		for _, coverage := range coverageList {
			if coverage.BuildProvider == buildProvider && coverage.BuildID == buildID {
				currentCoverageList = append(currentCoverageList, coverage)
			}
		}

		// 构建coverage ID列表
		var coverageIDs []string
		for _, coverage := range currentCoverageList {
			coverageIDs = append(coverageIDs, coverage.ID)
		}

		// 过滤hit数据
		filteredHitData := s.filterCoverageHitOldWay(coverageIDs, coverageHitQuerySqlResultJson)

		// 计算总体summary
		summary := s.calcCoverageSummaryOldWay(filteredHitData, coverageMapQuerySqlResultJsonWidth)

		// 构建auto mode
		autoMode := s.buildAutoModeOldWay(currentCoverageList, coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJsonWidth, testCaseInfoList)

		// 构建manual mode
		manualMode := s.buildManualModeOldWay(currentCoverageList, coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJsonWidth, testCaseInfoList)

		group := map[string]interface{}{
			"buildID":       buildID,
			"buildProvider": buildProvider,
			"summary":       summary,
			"modeList":      []interface{}{autoMode, manualMode},
		}

		resultList = append(resultList, group)
	}

	return resultList
}

// filterCoverageHitOldWay 按照老流程过滤coverage hit数据
func (s *CoverageService) filterCoverageHitOldWay(coverageIDs []string, coverageHitQuerySqlResultJson []map[string]interface{}) []map[string]interface{} {
	var result []map[string]interface{}

	for _, hitData := range coverageHitQuerySqlResultJson {
		coverageID := hitData["coverageID"].(string)
		for _, id := range coverageIDs {
			if coverageID == id {
				result = append(result, hitData)
				break
			}
		}
	}

	return result
}

// calcCoverageSummaryOldWay 按照老流程计算覆盖率摘要
func (s *CoverageService) calcCoverageSummaryOldWay(covHit []map[string]interface{}, covMap []map[string]interface{}) map[string]interface{} {
	// 构建hitMap
	hitMap := make(map[string]map[uint32]bool)
	for _, hitItem := range covHit {
		path := hitItem["fullFilePath"].(string)
		sKeys := hitItem["s"].([]uint32)

		if _, exists := hitMap[path]; !exists {
			hitMap[path] = make(map[uint32]bool)
		}

		for _, key := range sKeys {
			hitMap[path][key] = true
		}
	}

	// 计算covered数量
	var covered int
	for _, hitSet := range hitMap {
		covered += len(hitSet)
	}

	// 计算total数量
	var total int
	for _, mapItem := range covMap {
		sKeys := mapItem["s"].([]uint32)
		total += len(sKeys)
	}

	// 计算百分比
	var percent float64
	if total > 0 {
		percent = float64(covered) / float64(total) * 100
	}

	return map[string]interface{}{
		"total":   total,
		"covered": covered,
		"percent": percent,
	}
}

// buildAutoModeOldWay 按照老流程构建auto mode
func (s *CoverageService) buildAutoModeOldWay(
	coverageList []models.Coverage,
	coverageHitQuerySqlResultJson []map[string]interface{},
	coverageMapQuerySqlResultJsonWidth []map[string]interface{},
	testCaseInfoList []interface{},
) map[string]interface{} {
	// 过滤auto mode的coverage
	var autoCoverageList []models.Coverage
	for _, coverage := range coverageList {
		if coverage.ReportProvider == "mpaas" || coverage.ReportProvider == "flytest" {
			autoCoverageList = append(autoCoverageList, coverage)
		}
	}

	// 构建coverage ID列表
	var coverageIDs []string
	for _, coverage := range autoCoverageList {
		coverageIDs = append(coverageIDs, coverage.ID)
	}

	// 过滤hit数据
	filteredHitData := s.filterCoverageHitOldWay(coverageIDs, coverageHitQuerySqlResultJson)

	// 计算summary
	summary := s.calcCoverageSummaryOldWay(filteredHitData, coverageMapQuerySqlResultJsonWidth)

	// 构建caseList
	var caseList []interface{}
	for _, coverage := range autoCoverageList {
		// 计算单个case的summary
		singleHitData := s.filterCoverageHitOldWay([]string{coverage.ID}, coverageHitQuerySqlResultJson)
		caseSummary := s.calcCoverageSummaryOldWay(singleHitData, coverageMapQuerySqlResultJsonWidth)

		// 获取测试用例信息
		testCaseInfo := s.getTestCaseInfoOldWay(testCaseInfoList, coverage.ReportID, coverage.ReportProvider)

		caseItem := map[string]interface{}{
			"id":             coverage.ID,
			"repoID":         coverage.RepoID,
			"sha":            coverage.SHA,
			"buildProvider":  coverage.BuildProvider,
			"buildID":        coverage.BuildID,
			"reportProvider": coverage.ReportProvider,
			"reportID":       coverage.ReportID,
			"summary":        caseSummary,
		}

		// 合并测试用例信息
		for k, v := range testCaseInfo {
			caseItem[k] = v
		}

		caseList = append(caseList, caseItem)
	}

	return map[string]interface{}{
		"mode":     "auto",
		"summary":  summary,
		"caseList": caseList,
	}
}

// buildManualModeOldWay 按照老流程构建manual mode
func (s *CoverageService) buildManualModeOldWay(
	coverageList []models.Coverage,
	coverageHitQuerySqlResultJson []map[string]interface{},
	coverageMapQuerySqlResultJsonWidth []map[string]interface{},
	testCaseInfoList []interface{},
) map[string]interface{} {
	// 过滤manual mode的coverage
	var manualCoverageList []models.Coverage
	for _, coverage := range coverageList {
		if coverage.ReportProvider == "person" {
			manualCoverageList = append(manualCoverageList, coverage)
		}
	}

	// 构建coverage ID列表
	var coverageIDs []string
	for _, coverage := range manualCoverageList {
		coverageIDs = append(coverageIDs, coverage.ID)
	}

	// 过滤hit数据
	filteredHitData := s.filterCoverageHitOldWay(coverageIDs, coverageHitQuerySqlResultJson)

	// 计算summary
	summary := s.calcCoverageSummaryOldWay(filteredHitData, coverageMapQuerySqlResultJsonWidth)

	// 构建caseList
	var caseList []interface{}
	for _, coverage := range manualCoverageList {
		// 计算单个case的summary
		singleHitData := s.filterCoverageHitOldWay([]string{coverage.ID}, coverageHitQuerySqlResultJson)
		caseSummary := s.calcCoverageSummaryOldWay(singleHitData, coverageMapQuerySqlResultJsonWidth)

		// 获取测试用例信息
		testCaseInfo := s.getTestCaseInfoOldWay(testCaseInfoList, coverage.ReportID, coverage.ReportProvider)

		caseItem := map[string]interface{}{
			"id":             coverage.ID,
			"repoID":         coverage.RepoID,
			"sha":            coverage.SHA,
			"buildProvider":  coverage.BuildProvider,
			"buildID":        coverage.BuildID,
			"reportProvider": coverage.ReportProvider,
			"reportID":       coverage.ReportID,
			"summary":        caseSummary,
		}

		// 合并测试用例信息
		for k, v := range testCaseInfo {
			caseItem[k] = v
		}

		caseList = append(caseList, caseItem)
	}

	return map[string]interface{}{
		"mode":     "manual",
		"summary":  summary,
		"caseList": caseList,
	}
}

// getTestCaseInfoOldWay 按照老流程获取测试用例信息
func (s *CoverageService) getTestCaseInfoOldWay(testCaseInfoList []interface{}, reportID, reportProvider string) map[string]interface{} {
	for _, item := range testCaseInfoList {
		if itemMap, ok := item.(map[string]interface{}); ok {
			if itemMap["reportID"] == reportID && itemMap["reportProvider"] == reportProvider {
				return itemMap
			}
		}
	}

	// 如果没找到，返回默认值
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

// GetCoverageMapForPull 获取PR的覆盖率映射
// @Description 根据PR号获取该PR包含的所有commits的覆盖率映射数据
func (s *CoverageService) GetCoverageMapForPull(query dto.CoveragePullMapQueryDto) (interface{}, error) {
	// 日志追踪准备
	reqLog := NewRequestLogService()
	requestID := query.RequestID
	if requestID == "" {
		requestID = utils.GenerateRequestID()
	}
	traceID := requestID
	// 各步骤的span名称
	spanProject := fmt.Sprintf("project-%s", requestID)
	spanCommits := fmt.Sprintf("commits-%s", requestID)
	spanCoverages := fmt.Sprintf("coverages-%s", requestID)
	spanRelations := fmt.Sprintf("relations-%s", requestID)
	spanBaseline := fmt.Sprintf("baseline-%s", requestID)
	spanDiff := fmt.Sprintf("diff-%s", requestID)
	spanCKMap := fmt.Sprintf("ck-map-%s", requestID)
	spanCKHits := fmt.Sprintf("ck-hits-%s", requestID)
	spanMerge := fmt.Sprintf("merge-%s", requestID)

	// 第一步：根据PR号获取commits
	gitlabService := NewGitLabService()
	stepStart := time.Now()

	// 解析项目ID（假设repoID格式为 "owner/repo" 或数字ID）
	projectID, err := strconv.Atoi(query.RepoID)
	if err != nil {
		// 如果不是数字，尝试从路径获取项目信息
		projectInfo, err := gitlabService.GetProjectByPath(query.RepoID)
		if err != nil {
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanProject, "", "ERROR", "GetProjectByPath failed", map[string]interface{}{"repoID": query.RepoID}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
			return nil, fmt.Errorf("无法解析项目ID: %w", err)
		}
		if id, ok := projectInfo["id"].(float64); ok {
			projectID = int(id)
		} else {
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanProject, "", "ERROR", "project id missing in response", map[string]interface{}{"repoID": query.RepoID}, nil, query.RepoID, "", stepStart, time.Now())
			return nil, fmt.Errorf("无法获取项目ID")
		}
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanProject, "", "INFO", "project resolved", map[string]interface{}{"projectID": projectID}, nil, query.RepoID, "", stepStart, time.Now())

	// 解析PR号
	pullNumber, err := strconv.Atoi(query.PullNumber)
	if err != nil {
		return nil, fmt.Errorf("无效的PR号: %w", err)
	}

	// 获取PR的commits
	stepStart = time.Now()
	commits, err := gitlabService.GetPullRequestCommits(projectID, pullNumber)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCommits, "", "ERROR", "GetPullRequestCommits failed", map[string]interface{}{"projectID": projectID, "pullNumber": pullNumber}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("获取PR commits失败: %w", err)
	}

	if len(commits) == 0 {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 200, requestID, traceID, spanCommits, "", "INFO", "no commits in PR", map[string]interface{}{"pullNumber": pullNumber}, nil, query.RepoID, "", stepStart, time.Now())
		return map[string]interface{}{}, nil
	}

	// 第二步：收集所有commits的SHA
	shas := make([]string, len(commits))
	for i, commit := range commits {
		shas[i] = commit.ID
	}

	// 第三步：查询所有commits的coverage数据
	pgDB := db.GetDB()
	var allCoverageList []models.Coverage

	coverageQuery := pgDB.Where("provider = ? AND repo_id = ? AND sha IN ?",
		query.Provider, query.RepoID, shas)

	if query.BuildProvider != "" {
		coverageQuery = coverageQuery.Where("build_provider = ?", query.BuildProvider)
	}
	if query.BuildID != "" {
		coverageQuery = coverageQuery.Where("build_id = ?", query.BuildID)
	}

	stepStart = time.Now()
	if err := coverageQuery.Find(&allCoverageList).Error; err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCoverages, "", "ERROR", "query coverage list failed", map[string]interface{}{"shasCount": len(shas)}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}

	if len(allCoverageList) == 0 {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 200, requestID, traceID, spanCoverages, "", "INFO", "no coverage found for PR commits", map[string]interface{}{"commits": len(commits)}, nil, query.RepoID, "", stepStart, time.Now())
		return map[string]interface{}{}, nil
	}

	// 第四步：查询coverageMapRelation，获取coverage_map的hash
	coverageIDs := make([]string, len(allCoverageList))
	for i, coverage := range allCoverageList {
		coverageIDs[i] = coverage.ID
	}

	var coverageMapRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}

	relationQuery := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", coverageIDs)

	if query.FilePath != "" {
		relationQuery = relationQuery.Where("file_path = ?", query.FilePath)
	}

	stepStart = time.Now()
	if err := relationQuery.Group("coverage_map_hash_id, full_file_path").
		Find(&coverageMapRelations).Error; err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanRelations, "", "ERROR", "query coverage map relations failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("查询coverageMapRelation失败: %w", err)
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanRelations, "", "INFO", "relations fetched", map[string]interface{}{"relations": len(coverageMapRelations)}, nil, query.RepoID, "", stepStart, time.Now())

	// 第五步：选择“最新且有覆盖率”的baseline commit，并构建“旧commit -> 变更文件集合”
	// 统计哪些commit有覆盖率
	coveredSHASet := make(map[string]bool)
	for _, cov := range allCoverageList {
		coveredSHASet[cov.SHA] = true
	}
	// 在有覆盖率的commit中选取时间最新的一个作为baseline
	var baselineCommit models.JSON // 占位避免未用导入，实际我们直接用GitLabCommit
	_ = baselineCommit
	var baseline GitLabCommit
	var baselineFound bool
	for _, c := range commits {
		if !coveredSHASet[c.ID] {
			continue
		}
		if !baselineFound || c.CommittedDate.After(baseline.CommittedDate) {
			baseline = c
			baselineFound = true
		}
	}
	if !baselineFound {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 200, requestID, traceID, spanBaseline, "", "INFO", "no baseline with coverage found", nil, nil, query.RepoID, "", stepStart, time.Now())
		// 理论上不会发生（因为上方已校验有coverage），兜底直接返回空
		return map[string]interface{}{}, nil
	}
	latestSHA := baseline.ID
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanBaseline, "", "INFO", "baseline selected", map[string]interface{}{"sha": latestSHA}, nil, query.RepoID, latestSHA, stepStart, time.Now())

	// 将coverage按SHA分组，并建立coverageID到覆盖率记录的映射
	coverageIDToItem := make(map[string]models.Coverage)
	for _, cov := range allCoverageList {
		coverageIDToItem[cov.ID] = cov
	}

	// 为每个旧commit与最新commit做diff，记录差异文件（包含old/new path）
	changedFilesBySHA := make(map[string]map[string]bool)
	for _, c := range commits {
		if !coveredSHASet[c.ID] || c.ID == latestSHA {
			continue
		}
		stepStart = time.Now()
		diffs, err := gitlabService.GetCommitDiff(projectID, c.ID, latestSHA)
		if err != nil {
			// 若失败，跳过该commit的差异过滤
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanDiff, "", "WARN", "GetCommitDiff failed, skip this commit", map[string]interface{}{"from": c.ID, "to": latestSHA}, map[string]interface{}{"error": err.Error()}, query.RepoID, latestSHA, stepStart, time.Now())
			continue
		}
		if changedFilesBySHA[c.ID] == nil {
			changedFilesBySHA[c.ID] = make(map[string]bool)
		}
		for _, d := range diffs {
			if d.OldPath != "" {
				changedFilesBySHA[c.ID][d.OldPath] = true
			}
			if d.NewPath != "" {
				changedFilesBySHA[c.ID][d.NewPath] = true
			}
		}
		// 收集对比文件列表
		var changedFiles []string
		for fp := range changedFilesBySHA[c.ID] {
			changedFiles = append(changedFiles, fp)
		}
		_ = reqLog.RequestLogStep(
			utils.GenerateRequestID(),
			query.Provider,
			"backend",
			"/coverage/map/pull",
			"GET",
			0,
			requestID,
			traceID,
			spanDiff,
			"",
			"INFO",
			"collected changed files for commit",
			map[string]interface{}{
				"commit":       c.ShortID,
				"from":         c.ID,
				"to":           latestSHA,
				"changedCount": len(changedFiles),
				"changedFiles": changedFiles,
			},
			nil,
			query.RepoID,
			latestSHA,
			stepStart,
			time.Now(),
		)
	}

	// 第六步：查询coverage_map（重用现有方法），以及按coverage_id查询hit数据
	stepStart = time.Now()
	coverageMapResult, _, err := s.queryClickHouseData(
		coverageMapRelations, allCoverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCKMap, "", "ERROR", "query clickhouse coverage_map failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, latestSHA, stepStart, time.Now())
		return nil, err
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCKMap, "", "INFO", "coverage_map fetched", map[string]interface{}{"count": len(coverageMapResult)}, nil, query.RepoID, latestSHA, stepStart, time.Now())

	stepStart = time.Now()
	perCoverageHits, err := s.queryHitPerCoverage(allCoverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCKHits, "", "ERROR", "query clickhouse coverage_hit_agg failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, latestSHA, stepStart, time.Now())
		return nil, err
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 0, requestID, traceID, spanCKHits, "", "INFO", "coverage_hits fetched", map[string]interface{}{"count": len(perCoverageHits)}, nil, query.RepoID, latestSHA, stepStart, time.Now())

	// 第七步：基于最新commit过滤旧commit中“与最新不同”的文件覆盖率，并合并剩余hit
	// 聚合为按文件路径的汇总命中图
	type agg struct {
		S map[uint32]uint32
		F map[uint32]uint32
		B map[uint32]uint32
	}
	aggregatedByPath := make(map[string]*agg)

	for _, row := range perCoverageHits {
		cov, ok := coverageIDToItem[row.CoverageID]
		if !ok {
			continue
		}

		include := true
		if cov.SHA != latestSHA {
			// 归一化路径：移除instrumentCwd前缀后，与GitLab diff中的repo相对路径对齐
			normalized := strings.TrimPrefix(row.FullFilePath, cov.InstrumentCwd)
			normalized = strings.TrimPrefix(normalized, "/")
			if changedSet, exists := changedFilesBySHA[cov.SHA]; exists {
				if changedSet[normalized] {
					include = false // 该文件在旧commit与最新commit间有差异，排除旧commit对此文件的贡献
				}
			}
		}

		if !include {
			continue
		}

		// 合并到汇总
		a := aggregatedByPath[row.FullFilePath]
		if a == nil {
			a = &agg{S: make(map[uint32]uint32), F: make(map[uint32]uint32), B: make(map[uint32]uint32)}
			aggregatedByPath[row.FullFilePath] = a
		}
		for k, v := range row.S {
			a.S[k] += v
		}
		for k, v := range row.F {
			a.F[k] += v
		}
		for k, v := range row.B {
			a.B[k] += v
		}
	}

	// 转换为与合并函数兼容的结构
	var filteredHitResults []models.CoverageHitQueryResult
	for path, a := range aggregatedByPath {
		filteredHitResults = append(filteredHitResults, models.CoverageHitQueryResult{
			FullFilePath: path,
			S:            a.S,
			F:            a.F,
			B:            a.B,
		})
	}

	// 构建允许的文件路径集合，仅输出这些文件的覆盖率
	allowedPaths := make(map[string]bool)
	for path := range aggregatedByPath {
		allowedPaths[path] = true
	}

	// 过滤relations到允许的文件集合
	var filteredRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}
	for _, r := range coverageMapRelations {
		if allowedPaths[r.FullFilePath] {
			filteredRelations = append(filteredRelations, r)
		}
	}

	// 第八步：合并数据（仅限允许的文件路径）
	stepStart = time.Now()
	result := s.mergeCoverageMapAndHitResults(coverageMapResult, filteredHitResults, filteredRelations)
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/map/pull", "GET", 200, requestID, traceID, spanMerge, "", "INFO", "merged coverage map and hits", map[string]interface{}{"files": len(filteredRelations)}, nil, query.RepoID, latestSHA, stepStart, time.Now())

	// 第九步：移除instrumentCwd路径（使用第一个coverage的instrumentCwd）
	if len(allCoverageList) > 0 {
		result = s.removeCoverageInstrumentCwd(result, allCoverageList[0].InstrumentCwd)
	}

	return result, nil
}

// GetCoverageSummaryMapForPull 获取PR的覆盖率摘要映射（参考 GetCoverageMapForPull 合并逻辑 + GetCoverageSummaryMapFast 计算逻辑）
func (s *CoverageService) GetCoverageSummaryMapForPull(query dto.CoveragePullMapQueryDto) (map[string]interface{}, error) {
	// 1) 通过 PR 获取 commits 列表，收集 SHA
	gitlabService := NewGitLabService()
	reqLog := NewRequestLogService()
	requestID := query.RequestID
	if requestID == "" {
		requestID = utils.GenerateRequestID()
	}
	traceID := requestID
	spanProject := fmt.Sprintf("project-%s", requestID)
	spanCommits := fmt.Sprintf("commits-%s", requestID)
	// spanCoverages := fmt.Sprintf("coverages-%s", requestID)
	stepStart := time.Now()

	// 解析项目ID
	projectID, err := strconv.Atoi(query.RepoID)
	if err != nil {
		projectInfo, err := gitlabService.GetProjectByPath(query.RepoID)
		if err != nil {
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/summary/map/pull", "GET", 0, requestID, traceID, spanProject, "", "ERROR", "GetProjectByPath failed", map[string]interface{}{"repoID": query.RepoID}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
			return nil, fmt.Errorf("无法解析项目ID: %w", err)
		}
		if id, ok := projectInfo["id"].(float64); ok {
			projectID = int(id)
		} else {
			return nil, fmt.Errorf("无法获取项目ID")
		}
	}

	// 获取PR commits
	pullNumber, err := strconv.Atoi(query.PullNumber)
	if err != nil {
		return nil, fmt.Errorf("无效的PR号: %w", err)
	}
	commits, err := gitlabService.GetPullRequestCommits(projectID, pullNumber)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/summary/map/pull", "GET", 0, requestID, traceID, spanCommits, "", "ERROR", "GetPullRequestCommits failed", map[string]interface{}{"projectID": projectID, "pullNumber": pullNumber}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("获取PR commits失败: %w", err)
	}
	if len(commits) == 0 {
		return map[string]interface{}{}, nil
	}

	shas := make([]string, len(commits))
	for i, c := range commits {
		shas[i] = c.ID
	}

	// 2) 查找这些 SHA 的所有 coverage（不区分 build），获取 relations
	pgDB := db.GetDB()
	var allCoverageList []models.Coverage
	if err := pgDB.Where("provider = ? AND repo_id = ? AND sha IN ?", query.Provider, query.RepoID, shas).Find(&allCoverageList).Error; err != nil {
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}
	if len(allCoverageList) == 0 {
		return map[string]interface{}{}, nil
	}

	// relations（可选 filePath 过滤）
	coverageIDs := make([]string, len(allCoverageList))
	for i, cov := range allCoverageList {
		coverageIDs[i] = cov.ID
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

	// 3) 参考 GetCoverageSummaryMapFast：从 ClickHouse 聚合 per-file totals 和 covered
	// 3.1 构造 coverage_id IN 列表
	covIDs := make([]string, len(allCoverageList))
	for i, c := range allCoverageList {
		covIDs[i] = fmt.Sprintf("'%s'", c.ID)
	}
	// 3.2 可选的文件过滤
	fileFilter := ""
	if query.FilePath != "" {
		fileFilter = fmt.Sprintf(" AND full_file_path = '%s'", strings.ReplaceAll(query.FilePath, "'", "''"))
	}

	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// per-file hits
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

	type fileHits struct {
		S []interface{}
		F []interface{}
		B []interface{}
	}
	perFileHits := make(map[string]fileHits)
	hitRows, err := conn.Query(ctx, hitsSQL)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer hitRows.Close()
	for hitRows.Next() {
		var path string
		var sTuple, fTuple, bTuple []interface{}
		if err := hitRows.Scan(&path, &sTuple, &fTuple, &bTuple); err != nil {
			return nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}
		perFileHits[path] = fileHits{S: sTuple, F: fTuple, B: bTuple}
	}

	// map totals by hash
	hashSet := make(map[string]struct{})
	for _, r := range relations {
		hashSet[r.CoverageMapHashID] = struct{}{}
	}
	if len(hashSet) == 0 {
		return map[string]interface{}{}, nil
	}
	hashList := make([]string, 0, len(hashSet))
	for h := range hashSet {
		hashList = append(hashList, h)
	}
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

	type mapSizes struct{ SKeys, FKeys, BKeys, BPathSizes []interface{} }
	perHashSizes := make(map[string]mapSizes)
	mapRows, err := conn.Query(ctx, mapsSQL)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()
	for mapRows.Next() {
		var hash string
		var sKeys, fKeys, bKeys, bPathSizes []interface{}
		if err := mapRows.Scan(&hash, &sKeys, &fKeys, &bKeys, &bPathSizes); err != nil {
			return nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}
		perHashSizes[hash] = mapSizes{SKeys: sKeys, FKeys: fKeys, BKeys: bKeys, BPathSizes: bPathSizes}
	}

	// 4) 聚合为 per-file summary
	result := make(map[string]interface{})
	for _, r := range relations {
		sizes, ok := perHashSizes[r.CoverageMapHashID]
		if !ok {
			continue
		}

		totalS := len(sizes.SKeys)
		totalF := len(sizes.FKeys)
		totalB := 0
		for _, v := range sizes.BPathSizes {
			switch vv := v.(type) {
			case []uint32:
				totalB += len(vv)
			case []interface{}:
				totalB += len(vv)
			}
		}

		hits := perFileHits[r.FullFilePath]
		coveredS := len(s.convertInterfaceSliceToUint32Slice(hits.S))
		coveredF := len(s.convertInterfaceSliceToUint32Slice(hits.F))
		coveredB := len(s.convertInterfaceSliceToUint32Slice(hits.B))

		// 直接按行/语句一致处理 lines == statements
		// 直接按行/语句一致处理 lines == statements
		percent := func(c, t int) float64 {
			if t == 0 {
				return 100.0
			}
			return float64(c) / float64(t) * 100.0
		}

		summary := map[string]interface{}{
			"statements": map[string]interface{}{"total": totalS, "covered": coveredS, "skipped": 0, "pct": percent(coveredS, totalS)},
			"functions":  map[string]interface{}{"total": totalF, "covered": coveredF, "skipped": 0, "pct": percent(coveredF, totalF)},
			"branches":   map[string]interface{}{"total": totalB, "covered": coveredB, "skipped": 0, "pct": percent(coveredB, totalB)},
			"lines":      map[string]interface{}{"total": totalS, "covered": coveredS, "skipped": 0, "pct": percent(coveredS, totalS)},
			"path":       r.FullFilePath,
			"change":     false,
		}
		result[r.FullFilePath] = summary
	}

	// 5) 去掉插桩前缀
	if len(allCoverageList) > 0 {
		result = s.removeCoverageInstrumentCwd(result, allCoverageList[0].InstrumentCwd)
	}

	return result, nil
}

// GetCoverageSummaryForPull 获取PR覆盖率概览（合并所有构建，不区分buildID/buildProvider）
// @Description 根据PR号获取该PR包含的所有commits的覆盖率汇总摘要
func (s *CoverageService) GetCoverageSummaryForPull(query dto.CoveragePullQueryDto) (interface{}, error) {
	reqLog := NewRequestLogService()
	requestID := query.RequestID
	if requestID == "" {
		requestID = utils.GenerateRequestID()
	}
	traceID := requestID

	spanProject := fmt.Sprintf("project-%s", requestID)
	spanCommits := fmt.Sprintf("commits-%s", requestID)
	spanCoverages := fmt.Sprintf("coverages-%s", requestID)
	spanRelations := fmt.Sprintf("relations-%s", requestID)
	spanCK := fmt.Sprintf("ck-summary-%s", requestID)

	// 解析项目ID
	gitlabService := NewGitLabService()
	stepStart := time.Now()
	projectID, err := strconv.Atoi(query.RepoID)
	if err != nil {
		projectInfo, err := gitlabService.GetProjectByPath(query.RepoID)
		if err != nil {
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanProject, "", "ERROR", "GetProjectByPath failed", map[string]interface{}{"repoID": query.RepoID}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
			return nil, fmt.Errorf("无法解析项目ID: %w", err)
		}
		if id, ok := projectInfo["id"].(float64); ok {
			projectID = int(id)
		} else {
			_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanProject, "", "ERROR", "project id missing in response", map[string]interface{}{"repoID": query.RepoID}, nil, query.RepoID, "", stepStart, time.Now())
			return nil, fmt.Errorf("无法获取项目ID")
		}
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanProject, "", "INFO", "project resolved", map[string]interface{}{"projectID": projectID}, nil, query.RepoID, "", stepStart, time.Now())

	// 解析PR号并获取commits
	pullNumber, err := strconv.Atoi(query.PullNumber)
	if err != nil {
		return nil, fmt.Errorf("无效的PR号: %w", err)
	}
	stepStart = time.Now()
	commits, err := gitlabService.GetPullRequestCommits(projectID, pullNumber)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanCommits, "", "ERROR", "GetPullRequestCommits failed", map[string]interface{}{"projectID": projectID, "pullNumber": pullNumber}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("获取PR commits失败: %w", err)
	}
	if len(commits) == 0 {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 200, requestID, traceID, spanCommits, "", "INFO", "no commits in PR", map[string]interface{}{"pullNumber": pullNumber}, nil, query.RepoID, "", stepStart, time.Now())
		return map[string]interface{}{"total": 0, "covered": 0, "percent": 0.0}, nil
	}

	// 收集所有commits的SHA
	shas := make([]string, len(commits))
	for i, commit := range commits {
		shas[i] = commit.ID
	}

	// 查询这些SHA对应的所有coverage（不区分build）
	pgDB := db.GetDB()
	var allCoverageList []models.Coverage
	stepStart = time.Now()
	if err := pgDB.Where("provider = ? AND repo_id = ? AND sha IN ?", query.Provider, query.RepoID, shas).Find(&allCoverageList).Error; err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanCoverages, "", "ERROR", "query coverage list failed", map[string]interface{}{"shasCount": len(shas)}, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}
	if len(allCoverageList) == 0 {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 200, requestID, traceID, spanCoverages, "", "INFO", "no coverage found for PR commits", map[string]interface{}{"commits": len(commits)}, nil, query.RepoID, "", stepStart, time.Now())
		return map[string]interface{}{"total": 0, "covered": 0, "percent": 0.0}, nil
	}

	// 查询coverageMapRelation（合并去重）
	coverageMapRelationList, err := s.getCoverageMapRelationList(allCoverageList)
	if err != nil {
		return nil, err
	}
	_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanRelations, "", "INFO", "relations fetched", map[string]interface{}{"relations": len(coverageMapRelationList)}, nil, query.RepoID, "", stepStart, time.Now())

	// 去重hash ID并查询ClickHouse
	deduplicateHashIDList := s.deduplicateHashIDList(coverageMapRelationList)
	stepStart = time.Now()
	hitJson, mapJson, err := s.queryClickHouseDataOldWay(allCoverageList, deduplicateHashIDList)
	if err != nil {
		_ = reqLog.RequestLogStep(utils.GenerateRequestID(), query.Provider, "backend", "/coverage/overview/pulls", "GET", 0, requestID, traceID, spanCK, "", "ERROR", "query clickhouse summary failed", nil, map[string]interface{}{"error": err.Error()}, query.RepoID, "", stepStart, time.Now())
		return nil, err
	}

	// 合并filePath
	mapWithPath := s.mergeCoverageMapWithFilePathOldWay(coverageMapRelationList, mapJson)

	// 过滤hit并计算汇总摘要（合并所有构建）
	var coverageIDs []string
	for _, cov := range allCoverageList {
		coverageIDs = append(coverageIDs, cov.ID)
	}
	filteredHit := s.filterCoverageHitOldWay(coverageIDs, hitJson)
	summary := s.calcCoverageSummaryOldWay(filteredHit, mapWithPath)

	return summary, nil
}
