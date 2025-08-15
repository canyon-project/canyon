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
	// 第一步：查询coverage表，获取所有的coverageID
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

	if err := relationQuery.Group("coverage_map_hash_id, full_file_path").
		Find(&coverageMapRelations).Error; err != nil {
		return nil, fmt.Errorf("查询coverageMapRelation失败: %w", err)
	}

	// 第三步：并行查询ClickHouse
	coverageMapResult, coverageHitResult, err := s.queryClickHouseData(
		coverageMapRelations, coverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		return nil, err
	}

	// 第四步：合并数据
	result := s.mergeCoverageMapAndHitResults(coverageMapResult, coverageHitResult, coverageMapRelations)

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

			// 解析数据
			result.StatementMap = utils.ConvertStatementMap(statementMap)
			result.FnMap = utils.ParseFunctionMapSimple(fnMapStr)
			result.BranchMap = utils.ParseBranchMapSimple(branchMapStr)

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

// queryCoverageHitsWithCoverageID 查询 coverage_hit_agg，并保留 coverage_id 维度
func (s *CoverageService) queryCoverageHitsWithCoverageID(
	coverageList []models.Coverage,
	reportProvider, reportID string,
) ([]models.CoverageHitSummaryResult, error) {
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := s.buildCoverageHitQueryWithCoverageID(coverageList)
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

	return results, rows.Err()
}
