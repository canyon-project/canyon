package services

import (
	"backend/db"
	"backend/dto"
	"backend/models"
	"backend/utils"
	"context"
	"fmt"
	"time"

	"golang.org/x/sync/errgroup"
)

// getCoverageMapInternal 获取覆盖率映射的内部实现
func (s *CoverageService) getCoverageMapInternal(query dto.CoverageQueryDto) (interface{}, error) {
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

	var coverageMapResult []models.CoverageMapQueryResult
	var coverageHitResult []models.CoverageHitQueryResult

	// 使用errgroup进行并行查询
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
			if err := mapRows.ScanStruct(&result); err != nil {
				return fmt.Errorf("扫描coverage_map结果失败: %w", err)
			}
			coverageMapResult = append(coverageMapResult, result)
		}

		if err := mapRows.Err(); err != nil {
			return fmt.Errorf("遍历coverage_map结果失败: %w", err)
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
			var fullFilePath string
			var sData, fData, bData []interface{}

			if err := hitRows.Scan(&fullFilePath, &sData, &fData, &bData); err != nil {
				return fmt.Errorf("扫描coverage_hit结果失败: %w", err)
			}

			// 转换tuple slice为uint32 map
			result := models.CoverageHitQueryResult{
				FullFilePath: fullFilePath,
				S:            s.convertTupleSliceToUint32Map(sData),
				F:            s.convertTupleSliceToUint32Map(fData),
				B:            s.convertTupleSliceToUint32Map(bData),
			}
			coverageHitResult = append(coverageHitResult, result)
		}

		return hitRows.Err()
	})

	return coverageMapResult, coverageHitResult, g.Wait()
}