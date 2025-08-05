package services

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"fmt"
	"time"
)

// ClickHouseService ClickHouse服务
type ClickHouseService struct{}

// NewClickHouseService 创建ClickHouse服务实例
func NewClickHouseService() *ClickHouseService {
	return &ClickHouseService{}
}

// GetCoverageHitAgg 根据coverage_id获取覆盖率聚合数据
func (s *ClickHouseService) GetCoverageHitAgg(coverageID string) ([]models.CoverageHitAgg, error) {
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT 
			coverage_id,
			full_file_path,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b,
			max(latest_ts) AS latest_ts
		FROM default.coverage_hit_agg
		WHERE coverage_id = ?
		GROUP BY coverage_id, full_file_path
		ORDER BY full_file_path
	`

	rows, err := conn.Query(ctx, query, coverageID)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer rows.Close()

	var results []models.CoverageHitAgg
	for rows.Next() {
		var (
			coverageID, fullFilePath string
			sTuple, fTuple, bTuple   []interface{}
			latestTs                 time.Time
		)
		err := rows.Scan(
			&coverageID,
			&fullFilePath,
			&sTuple,
			&fTuple,
			&bTuple,
			&latestTs,
		)
		if err != nil {
			return nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		// 转换tuple slice为uint32 map
		item := models.CoverageHitAgg{
			CoverageID:   coverageID,
			FullFilePath: fullFilePath,
			S:            s.convertTupleSliceToUint32Map(sTuple),
			F:            s.convertTupleSliceToUint32Map(fTuple),
			B:            s.convertTupleSliceToUint32Map(bTuple),
			LatestTs:     latestTs,
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("遍历coverage_hit_agg结果失败: %w", err)
	}

	return results, nil
}

// GetCoverageMap 根据hash获取覆盖率映射数据（使用混合解析方法）
func (s *ClickHouseService) GetCoverageMap(hash string) (*models.ParsedCoverageRecord, error) {
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 查询字符串格式的数据进行解析
	query := `
		SELECT 
			hash,
			statement_map,
			toString(fn_map) as fn_map_str,
			toString(branch_map) as branch_map_str,
			toString(restore_statement_map) as restore_statement_map_str,
			toString(restore_fn_map) as restore_fn_map_str,
			toString(restore_branch_map) as restore_branch_map_str,
			ts
		FROM default.coverage_map 
		WHERE hash = ?
		ORDER BY ts DESC
		LIMIT 1
	`

	var (
		resultHash, fnMapStr, branchMapStr             string
		restoreStmtStr, restoreFnStr, restoreBranchStr string
		statementMap                                   map[uint32][]interface{}
		ts                                             time.Time
	)

	row := conn.QueryRow(ctx, query, hash)
	err := row.Scan(&resultHash, &statementMap, &fnMapStr, &branchMapStr,
		&restoreStmtStr, &restoreFnStr, &restoreBranchStr, &ts)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}

	// 解析各种映射
	parsedRecord := &models.ParsedCoverageRecord{
		Hash: resultHash,
		Ts:   ts,
	}

	// 转换语句映射
	parsedRecord.StatementMap = utils.ConvertStatementMap(statementMap)

	// 解析字符串格式的映射
	parsedRecord.FnMap = utils.ParseFunctionMapSimple(fnMapStr)
	parsedRecord.BranchMap = utils.ParseBranchMapSimple(branchMapStr)
	parsedRecord.RestoreStatementMap = utils.ParseStatementMapSimple(restoreStmtStr)
	parsedRecord.RestoreFnMap = utils.ParseFunctionMapSimple(restoreFnStr)
	parsedRecord.RestoreBranchMap = utils.ParseBranchMapSimple(restoreBranchStr)

	return parsedRecord, nil
}

// GetCoverageHitAggBySHA 根据SHA获取覆盖率聚合数据（通过关联PostgreSQL的coverage表）
func (s *ClickHouseService) GetCoverageHitAggBySHA(repoID, sha string) ([]models.CoverageHitAgg, error) {
	// 首先从PostgreSQL获取coverage_id
	pgDB := db.GetDB()
	var coverageIDs []string
	
	if err := pgDB.Model(&models.Coverage{}).
		Where("repo_id = ? AND sha = ?", repoID, sha).
		Pluck("id", &coverageIDs).Error; err != nil {
		return nil, fmt.Errorf("查询coverage_id失败: %w", err)
	}

	if len(coverageIDs) == 0 {
		return []models.CoverageHitAgg{}, nil
	}

	// 然后从ClickHouse查询聚合数据
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 构建IN查询
	query := `
		SELECT 
			coverage_id,
			full_file_path,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b,
			max(latest_ts) AS latest_ts
		FROM default.coverage_hit_agg
		WHERE coverage_id IN (` + s.buildPlaceholders(len(coverageIDs)) + `)
		GROUP BY coverage_id, full_file_path
		ORDER BY coverage_id, full_file_path
	`

	// 转换为interface{}切片
	args := make([]interface{}, len(coverageIDs))
	for i, id := range coverageIDs {
		args[i] = id
	}

	rows, err := conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer rows.Close()

	var results []models.CoverageHitAgg
	for rows.Next() {
		var (
			coverageID, fullFilePath string
			sTuple, fTuple, bTuple   []interface{}
			latestTs                 time.Time
		)
		err := rows.Scan(
			&coverageID,
			&fullFilePath,
			&sTuple,
			&fTuple,
			&bTuple,
			&latestTs,
		)
		if err != nil {
			return nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
		}

		// 转换tuple slice为uint32 map
		item := models.CoverageHitAgg{
			CoverageID:   coverageID,
			FullFilePath: fullFilePath,
			S:            s.convertTupleSliceToUint32Map(sTuple),
			F:            s.convertTupleSliceToUint32Map(fTuple),
			B:            s.convertTupleSliceToUint32Map(bTuple),
			LatestTs:     latestTs,
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("遍历coverage_hit_agg结果失败: %w", err)
	}

	return results, nil
}

// buildPlaceholders 构建SQL占位符
func (s *ClickHouseService) buildPlaceholders(count int) string {
	if count == 0 {
		return ""
	}
	
	placeholders := "?"
	for i := 1; i < count; i++ {
		placeholders += ",?"
	}
	return placeholders
}

// TestConnection 测试ClickHouse连接
func (s *ClickHouseService) TestConnection() error {
	return db.ClickHouseHealthCheck()
}

// TestRawQuery 测试原始查询，用于调试
func (s *ClickHouseService) TestRawQuery(coverageID string) (interface{}, error) {
	conn := db.GetClickHouseDB()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	query := `
		SELECT 
			coverage_id,
			full_file_path,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b,
			max(latest_ts) AS latest_ts
		FROM default.coverage_hit_agg
		WHERE coverage_id = ?
		GROUP BY coverage_id, full_file_path
		ORDER BY full_file_path
		LIMIT 1
	`

	rows, err := conn.Query(ctx, query, coverageID)
	if err != nil {
		return nil, fmt.Errorf("查询失败: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		var (
			coverageID, fullFilePath string
			sTuple, fTuple, bTuple   []interface{}
			latestTs                 time.Time
		)
		err := rows.Scan(
			&coverageID,
			&fullFilePath,
			&sTuple,
			&fTuple,
			&bTuple,
			&latestTs,
		)
		if err != nil {
			return nil, fmt.Errorf("扫描失败: %w", err)
		}

		return map[string]interface{}{
			"coverage_id":    coverageID,
			"full_file_path": fullFilePath,
			"s_raw":          sTuple,
			"f_raw":          fTuple,
			"b_raw":          bTuple,
			"s_type":         fmt.Sprintf("%T", sTuple),
			"f_type":         fmt.Sprintf("%T", fTuple),
			"b_type":         fmt.Sprintf("%T", bTuple),
			"latest_ts":      latestTs,
		}, nil
	}

	return map[string]interface{}{"message": "no data found"}, nil
}

// convertTupleSliceToUint32Map 将ClickHouse tuple slice转换为uint32 map
// tuple格式: [keys_array, values_array]
func (s *ClickHouseService) convertTupleSliceToUint32Map(tupleSlice []interface{}) map[uint32]uint32 {
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