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
)

// CoverageService 覆盖率服务
type CoverageService struct{}

// NewCoverageService 创建覆盖率服务实例
func NewCoverageService() *CoverageService {
	return &CoverageService{}
}

// GetCoverageMap 获取覆盖率映射 - 实现完整的coverage final逻辑
func (s *CoverageService) GetCoverageMap(query dto.CoverageQueryDto) (interface{}, error) {
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

	// 查询coverage_map
	coverageMapQuery := s.buildCoverageMapQuery(hashList)
	mapRows, err := conn.Query(ctx, coverageMapQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_map失败: %w", err)
	}
	defer mapRows.Close()

	var coverageMapResult []models.CoverageMapQueryResult
	for mapRows.Next() {
		var result models.CoverageMapQueryResult
		var (
			statementMap, restoreStatementMap map[uint32][]interface{}
			fnMapStr, branchMapStr            string
			restoreFnMapStr, restoreBranchMapStr string
		)
		
		err := mapRows.Scan(
			&statementMap,
			&fnMapStr,
			&branchMapStr,
			&restoreStatementMap,
			&restoreFnMapStr,
			&restoreBranchMapStr,
			&result.CoverageMapHashID,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_map数据失败: %w", err)
		}

		// 解析数据
		result.StatementMap = utils.ConvertStatementMap(statementMap)
		result.FnMap = utils.ParseFunctionMapSimple(fnMapStr)
		result.BranchMap = utils.ParseBranchMapSimple(branchMapStr)
		result.RestoreStatementMap = utils.ConvertStatementMap(restoreStatementMap)
		result.RestoreFnMap = utils.ParseFunctionMapSimple(restoreFnMapStr)
		result.RestoreBranchMap = utils.ParseBranchMapSimple(restoreBranchMapStr)

		coverageMapResult = append(coverageMapResult, result)
	}

	// 查询coverage_hit_agg
	coverageHitQuery := s.buildCoverageHitQuery(coverageList, reportProvider, reportID)
	hitRows, err := conn.Query(ctx, coverageHitQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("查询coverage_hit_agg失败: %w", err)
	}
	defer hitRows.Close()

	var coverageHitResult []models.CoverageHitQueryResult
	for hitRows.Next() {
		var (
			fullFilePath string
			sTuple, fTuple, bTuple []interface{}
		)
		err := hitRows.Scan(
			&fullFilePath,
			&sTuple,
			&fTuple,
			&bTuple,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("扫描coverage_hit_agg数据失败: %w", err)
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

	return coverageMapResult, coverageHitResult, nil
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
		       restore_statement_map as restoreStatementMap,
		       toString(restore_fn_map) as restoreFnMap,
		       toString(restore_branch_map) as restoreBranchMap,
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