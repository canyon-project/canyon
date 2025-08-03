package services

import (
    "backend/db"
    "backend/models"
    "context"
    "fmt"
    "strings"
    "strconv"
)

// CoverageQueryParams represents query parameters for coverage
type CoverageQueryParams struct {
    Provider string `form:"provider"`
    RepoID   string `form:"repoID"`
    SHA      string `form:"sha"`
}

// CoverageFinalService handles coverage final operations
type CoverageFinalService struct{}

// NewCoverageFinalService creates a new coverage final service
func NewCoverageFinalService() *CoverageFinalService {
    return &CoverageFinalService{}
}

// GetCoverageMap retrieves coverage map data
func (s *CoverageFinalService) GetCoverageMap(params CoverageQueryParams) (map[string]interface{}, error) {
    // 第一步：查询coverage表，获取所有的 coverageID
    coverageList, err := s.getCoverageList(params)
    if err != nil {
        return nil, fmt.Errorf("failed to get coverage list: %w", err)
    }

    if len(coverageList) == 0 {
        return make(map[string]interface{}), nil
    }

    // 第二步：获取 coverage_map_relation 数据
    coverageMapRelationList, err := s.getCoverageMapRelations(coverageList, "") // No filePath in params
    if err != nil {
        return nil, fmt.Errorf("failed to get coverage map relations: %w", err)
    }

    // 第三步：查询 ClickHouse
    coverageMapData, err := s.getCoverageMapFromClickHouse(coverageMapRelationList)
    if err != nil {
        return nil, fmt.Errorf("failed to get coverage map from ClickHouse: %w", err)
    }
    // 类型转换
    convertedMapData := s.convertCoverageMapData(coverageMapData)
    coverageHitData, err := s.getCoverageHitFromClickHouse(coverageList, params)
    if err != nil {
        return nil, fmt.Errorf("failed to get coverage hit from ClickHouse: %w", err)
    }
    convertedHitData := convertHitResult(coverageHitData)
    result := s.mergeCoverageMapAndHitData(convertedMapData, convertedHitData)

    // 第五步：移除 instrumentCwd
    if len(coverageList) > 0 {
        result = s.removeInstrumentCwd(result, coverageList[0].InstrumentCwd)
    }

    return result, nil
}

// GetCoverageSummaryMap retrieves coverage summary map data
func (s *CoverageFinalService) GetCoverageSummaryMap(params CoverageQueryParams) (map[string]interface{}, error) {
    coverageMap, err := s.GetCoverageMap(params)
    if err != nil {
        return nil, err
    }

    // 生成摘要数据
    summaryMap := s.generateSummaryMap(coverageMap)
    return summaryMap, nil
}

// getCoverageList retrieves coverage records from database
func (s *CoverageFinalService) getCoverageList(params CoverageQueryParams) ([]models.CoverageFromSchema, error) {
    var coverages []models.CoverageFromSchema

    query := db.DB.Model(&models.CoverageFromSchema{}).
        Where("provider = ? AND repo_id = ? AND sha = ?", params.Provider, params.RepoID, params.SHA)

    err := query.Find(&coverages).Error
    return coverages, err
}

// getCoverageMapRelations retrieves coverage map relations
func (s *CoverageFinalService) getCoverageMapRelations(coverages []models.CoverageFromSchema, filePath string) ([]models.CoverageMapRelation, error) {
    if len(coverages) == 0 {
        return nil, nil
    }

    var coverageIDs []string
    for _, coverage := range coverages {
        coverageIDs = append(coverageIDs, coverage.ID)
    }

    var relations []models.CoverageMapRelation
    query := db.DB.Model(&models.CoverageMapRelation{}).
        Where("coverage_id IN ?", coverageIDs)

    if filePath != "" {
        query = query.Where("file_path = ?", filePath)
    }

    err := query.Find(&relations).Error
    return relations, err
}

// getCoverageMapFromClickHouse retrieves coverage map data from ClickHouse
func (s *CoverageFinalService) getCoverageMapFromClickHouse(relations []models.CoverageMapRelation) ([]CoverageMapWithFilePath, error) {
    if len(relations) == 0 {
        return nil, nil
    }

    var hashList []string
    for _, relation := range relations {
        hashList = append(hashList, relation.CoverageMapHashID)
    }

    query := fmt.Sprintf(`
		SELECT
			CASE 
				WHEN length(toString(statement_map)) > 0 THEN toString(statement_map)
				ELSE '{}'
			END as statementMap,
			CASE 
				WHEN length(toString(fn_map)) > 0 THEN toString(fn_map)
				ELSE '{}'
			END as fnMap,
			CASE 
				WHEN length(toString(branch_map)) > 0 THEN toString(branch_map)
				ELSE '{}'
			END as branchMap,
			CASE 
				WHEN length(toString(restore_statement_map)) > 0 THEN toString(restore_statement_map)
				ELSE '{}'
			END as restoreStatementMap,
			CASE 
				WHEN length(toString(restore_fn_map)) > 0 THEN toString(restore_fn_map)
				ELSE '{}'
			END as restoreFnMap,
			CASE 
				WHEN length(toString(restore_branch_map)) > 0 THEN toString(restore_branch_map)
				ELSE '{}'
			END as restoreBranchMap,
			hash as coverageMapHashID
		FROM default.coverage_map
		WHERE hash IN ('%s')
	`, strings.Join(hashList, "', '"))

    ctx := context.Background()
    rows, err := db.ClickHouseDB.Query(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    // 打印查询结果行数
    rowCount := 0
    var results []CoverageMapWithFilePath
    for rows.Next() {
        rowCount++
        var item CoverageMapWithFilePath
        err := rows.Scan(
            &item.StatementMap,
            &item.FnMap,
            &item.BranchMap,
            &item.RestoreStatementMap,
            &item.RestoreFnMap,
            &item.RestoreBranchMap,
            &item.CoverageMapHashID,
        )
        if err != nil {
            return nil, err
        }

        // 添加 fullFilePath
        for _, relation := range relations {
            if relation.CoverageMapHashID == item.CoverageMapHashID {
                item.FullFilePath = relation.FullFilePath
                break
            }
        }

        // 打印第一行的详细信息
        if rowCount == 1 {
            fmt.Printf("DEBUG: First row - HashID: %s, FullFilePath: %s\n", item.CoverageMapHashID, item.FullFilePath)
            fmt.Printf("DEBUG: First row - Raw StatementMap: '%s'\n", item.StatementMap)
            fmt.Printf("DEBUG: First row - Raw FnMap: '%s'\n", item.FnMap)
            fmt.Printf("DEBUG: First row - Raw BranchMap: '%s'\n", item.BranchMap)
        }

        results = append(results, item)
    }

    fmt.Printf("DEBUG: ClickHouse query returned %d rows\n", rowCount)

    return results, nil
}

// getCoverageHitFromClickHouse retrieves coverage hit data from ClickHouse
func (s *CoverageFinalService) getCoverageHitFromClickHouse(coverages []models.CoverageFromSchema, params CoverageQueryParams) ([]CoverageHitResult, error) {
    if len(coverages) == 0 {
        return nil, nil
    }

    // 过滤 coverage 列表
    var filteredCoverages []models.CoverageFromSchema
    for _, coverage := range coverages {
        if (params.Provider == "" || coverage.Provider == params.Provider) &&
            (params.RepoID == "" || coverage.RepoID == params.RepoID) &&
            (params.SHA == "" || coverage.SHA == params.SHA) {
            filteredCoverages = append(filteredCoverages, coverage)
        }
    }

    if len(filteredCoverages) == 0 {
        return nil, nil
    }

    var coverageIDs []string
    for _, coverage := range filteredCoverages {
        coverageIDs = append(coverageIDs, coverage.ID)
    }

    query := fmt.Sprintf(`
		SELECT
			full_file_path as fullFilePath,
			sumMapMerge(s) AS s,
			sumMapMerge(f) AS f,
			sumMapMerge(b) AS b
		FROM default.coverage_hit_agg
		WHERE coverage_id IN ('%s')
		GROUP BY full_file_path
	`, strings.Join(coverageIDs, "', '"))

    ctx := context.Background()
    rows, err := db.ClickHouseDB.Query(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var results []CoverageHitResult
    for rows.Next() {
        var item CoverageHitResult
        err := rows.Scan(
            &item.FullFilePath,
            &item.S,
            &item.F,
            &item.B,
        )
        if err != nil {
            return nil, err
        }
        results = append(results, item)
    }

    return results, nil
}

// mergeCoverageMapAndHitData merges coverage map and hit data into Istanbul format
func (s *CoverageFinalService) mergeCoverageMapAndHitData(
    coverageMapData []struct {
    StatementMap        map[uint32][4]uint32
    FnMap               map[uint32]models.FunctionMapEntry
    BranchMap           map[uint32]models.BranchMapEntry
    RestoreStatementMap map[uint32][4]uint32
    RestoreFnMap        map[uint32]models.FunctionMapEntry
    RestoreBranchMap    map[uint32]models.BranchMapEntry
    CoverageMapHashID   string
    FullFilePath        string
},
    coverageHitData []struct {
    FullFilePath string
    S            map[uint32]uint32
    F            map[uint32]uint32
    B            map[uint32]uint32
},
) map[string]interface{} {
    result := make(map[string]interface{})

    for _, mapItem := range coverageMapData {
        fileCoverageItem := map[string]interface{}{
            "path":         mapItem.FullFilePath,
            "statementMap": s.transformStatementMap(mapItem.StatementMap),
            "fnMap":        s.transformFnMap(mapItem.FnMap),
            "branchMap":    s.transformBranchMap(mapItem.BranchMap),
        }

        // 查找对应的 hit 数据
        var hitItem *struct {
            FullFilePath string
            S            map[uint32]uint32
            F            map[uint32]uint32
            B            map[uint32]uint32
        }
        for _, hit := range coverageHitData {
            if hit.FullFilePath == mapItem.FullFilePath {
                hitItem = &hit
                break
            }
        }

        if hitItem != nil {
            fileCoverageItemWithHit := map[string]interface{}{
                "path": mapItem.FullFilePath,
                "s":    s.transformHitMap(hitItem.S),
                "f":    s.transformHitMap(hitItem.F),
                "b":    s.transformHitMap(hitItem.B),
            }

            result[mapItem.FullFilePath] = s.restructureCoverageData(fileCoverageItemWithHit, fileCoverageItem)
        } else {
            // 如果没有 hit 数据，使用空的 hit 数据
            fileCoverageItemWithHit := map[string]interface{}{
                "path": mapItem.FullFilePath,
                "s":    make(map[string]int),
                "f":    make(map[string]int),
                "b":    make(map[string]int),
            }

            result[mapItem.FullFilePath] = s.restructureCoverageData(fileCoverageItemWithHit, fileCoverageItem)
        }
    }

    return result
}

// generateSummaryMap generates summary map from coverage map
func (s *CoverageFinalService) generateSummaryMap(coverageMap map[string]interface{}) map[string]interface{} {
    summaryMap := make(map[string]interface{})

    for filePath, coverage := range coverageMap {
        coverageData, ok := coverage.(map[string]interface{})
        if !ok {
            continue
        }

        summary := s.calculateFileSummary(coverageData)
        summaryMap[filePath] = summary
    }

    return summaryMap
}

// calculateFileSummary calculates summary for a single file
func (s *CoverageFinalService) calculateFileSummary(coverageData map[string]interface{}) map[string]interface{} {
    statementMap, _ := coverageData["statementMap"].(map[string]interface{})
    fnMap, _ := coverageData["fnMap"].(map[string]interface{})
    branchMap, _ := coverageData["branchMap"].(map[string]interface{})
    hitS, _ := coverageData["s"].(map[string]int)
    hitF, _ := coverageData["f"].(map[string]int)
    hitB, _ := coverageData["b"].(map[string]int)

    statementsTotal := len(statementMap)
    statementsCovered := 0
    for _, hit := range hitS {
        if hit > 0 {
            statementsCovered++
        }
    }

    functionsTotal := len(fnMap)
    functionsCovered := 0
    for _, hit := range hitF {
        if hit > 0 {
            functionsCovered++
        }
    }

    branchesTotal := 0
    branchesCovered := 0
    for _, branchData := range branchMap {
        if branchInfo, ok := branchData.(map[string]interface{}); ok {
            if locations, ok := branchInfo["locations"].([]interface{}); ok {
                branchesTotal += len(locations)
                branchKey := fmt.Sprintf("%v", branchInfo["line"])
                if hit, exists := hitB[branchKey]; exists && hit > 0 {
                    branchesCovered += len(locations)
                }
            }
        }
    }

    linesTotal := 0
    linesCovered := 0
    lineMap := make(map[int]bool)
    for _, stmt := range statementMap {
        if stmtInfo, ok := stmt.(map[string]interface{}); ok {
            if start, ok := stmtInfo["start"].(map[string]interface{}); ok {
                if line, ok := start["line"].(float64); ok {
                    lineNum := int(line)
                    if !lineMap[lineNum] {
                        lineMap[lineNum] = true
                        linesTotal++
                    }
                }
            }
        }
    }

    // 计算覆盖的行数
    for lineNum := range lineMap {
        lineKey := fmt.Sprintf("%d", lineNum)
        if hit, exists := hitS[lineKey]; exists && hit > 0 {
            linesCovered++
        }
    }

    return map[string]interface{}{
        "statements": map[string]interface{}{
            "total":   statementsTotal,
            "covered": statementsCovered,
            "skipped": 0,
            "pct":     s.calculatePercentage(statementsCovered, statementsTotal),
        },
        "functions": map[string]interface{}{
            "total":   functionsTotal,
            "covered": functionsCovered,
            "skipped": 0,
            "pct":     s.calculatePercentage(functionsCovered, functionsTotal),
        },
        "branches": map[string]interface{}{
            "total":   branchesTotal,
            "covered": branchesCovered,
            "skipped": 0,
            "pct":     s.calculatePercentage(branchesCovered, branchesTotal),
        },
        "lines": map[string]interface{}{
            "total":   linesTotal,
            "covered": linesCovered,
            "skipped": 0,
            "pct":     s.calculatePercentage(linesCovered, linesTotal),
        },
    }
}

// calculatePercentage calculates percentage with proper handling of zero division
func (s *CoverageFinalService) calculatePercentage(covered, total int) float64 {
    if total == 0 {
        return 0.0
    }
    return float64(covered) / float64(total) * 100
}

// transformStatementMap transforms statement map to Istanbul format
func (s *CoverageFinalService) transformStatementMap(statementMap map[uint32][4]uint32) map[string]interface{} {
    result := make(map[string]interface{})
    for key, value := range statementMap {
        result[fmt.Sprintf("%d", key)] = map[string]interface{}{
            "start": map[string]interface{}{
                "line":   value[0],
                "column": value[1],
            },
            "end": map[string]interface{}{
                "line":   value[2],
                "column": value[3],
            },
        }
    }
    return result
}

// transformFnMap transforms function map to Istanbul format
func (s *CoverageFinalService) transformFnMap(fnMap map[uint32]models.FunctionMapEntry) map[string]interface{} {
    result := make(map[string]interface{})
    for key, value := range fnMap {
        result[fmt.Sprintf("%d", key)] = map[string]interface{}{
            "name": value.Name,
            "line": value.Line,
            "loc": map[string]interface{}{
                "start": map[string]interface{}{
                    "line":   value.StartLoc[0],
                    "column": value.StartLoc[1],
                },
                "end": map[string]interface{}{
                    "line":   value.EndLoc[0],
                    "column": value.EndLoc[1],
                },
            },
        }
    }
    return result
}

// transformBranchMap transforms branch map to Istanbul format
func (s *CoverageFinalService) transformBranchMap(branchMap map[uint32]models.BranchMapEntry) map[string]interface{} {
    result := make(map[string]interface{})
    for key, value := range branchMap {
        result[fmt.Sprintf("%d", key)] = map[string]interface{}{
            "type": value.Type,
            "line": value.Line,
            "loc": map[string]interface{}{
                "start": map[string]interface{}{
                    "line":   value.Loc[0],
                    "column": value.Loc[1],
                },
                "end": map[string]interface{}{
                    "line":   value.Loc[2],
                    "column": value.Loc[3],
                },
            },
            "locations": value.Locations,
        }
    }
    return result
}

// transformHitMap transforms hit map from uint32 keys to string keys
func (s *CoverageFinalService) transformHitMap(hitMap map[uint32]uint32) map[string]int {
    result := make(map[string]int)
    for key, value := range hitMap {
        result[fmt.Sprintf("%d", key)] = int(value)
    }
    return result
}

// restructureCoverageData restructures coverage data to Istanbul format
func (s *CoverageFinalService) restructureCoverageData(fileCoverageItemWithHit, fileCoverageItem map[string]interface{}) map[string]interface{} {
    result := make(map[string]interface{})

    // 复制基础数据
    for key, value := range fileCoverageItemWithHit {
        result[key] = value
    }

    // 添加 statementMap, fnMap, branchMap
    if statementMap, ok := fileCoverageItem["statementMap"]; ok {
        result["statementMap"] = statementMap
    }
    if fnMap, ok := fileCoverageItem["fnMap"]; ok {
        result["fnMap"] = fnMap
    }
    if branchMap, ok := fileCoverageItem["branchMap"]; ok {
        result["branchMap"] = branchMap
    }

    return result
}

// removeInstrumentCwd removes instrumentCwd from file paths
func (s *CoverageFinalService) removeInstrumentCwd(coverageMap map[string]interface{}, instrumentCwd string) map[string]interface{} {
    if instrumentCwd == "" {
        return coverageMap
    }

    result := make(map[string]interface{})
    for filePath, coverage := range coverageMap {
        // 移除 instrumentCwd 前缀
        newFilePath := strings.TrimPrefix(filePath, instrumentCwd)
        if strings.HasPrefix(newFilePath, "/") {
            newFilePath = newFilePath[1:]
        }
        result[newFilePath] = coverage
    }

    return result
}

// CoverageMapWithFilePath represents coverage map data with file path
type CoverageMapWithFilePath struct {
	StatementMap        string `json:"statementMap"`
	FnMap               string `json:"fnMap"`
	BranchMap           string `json:"branchMap"`
	RestoreStatementMap string `json:"restoreStatementMap"`
	RestoreFnMap        string `json:"restoreFnMap"`
	RestoreBranchMap    string `json:"restoreBranchMap"`
	CoverageMapHashID   string `json:"coverageMapHashID"`
	FullFilePath        string `json:"fullFilePath"`
}

// CoverageHitResult represents coverage hit result from ClickHouse
type CoverageHitResult struct {
    FullFilePath string        `json:"fullFilePath"`
    S            []interface{} `json:"s"`
    F            []interface{} `json:"f"`
    B            []interface{} `json:"b"`
}



func toUint32(val interface{}) uint32 {
    switch v := val.(type) {
    case uint8:
        return uint32(v)
    case uint16:
        return uint32(v)
    case uint32:
        return v
    case uint64:
        return uint32(v)
    case int64:
        return uint32(v)
    case int:
        return uint32(v)
    }
    return 0
}

func toUint8(val interface{}) uint8 {
    switch v := val.(type) {
    case uint8:
        return v
    case uint16:
        return uint8(v)
    case uint32:
        return uint8(v)
    case uint64:
        return uint8(v)
    case int64:
        return uint8(v)
    case int:
        return uint8(v)
    }
    return 0
}

func tupleTo4Uint32(val interface{}) [4]uint32 {
    arr := [4]uint32{}
    if tuple, ok := val.([]interface{}); ok && len(tuple) == 4 {
        for i := 0; i < 4; i++ {
            arr[i] = toUint32(tuple[i])
        }
    }
    return arr
}

func arrayOfTupleTo4Uint32(val interface{}) [][4]uint32 {
    var result [][4]uint32
    if arr, ok := val.([]interface{}); ok {
        for _, item := range arr {
            result = append(result, tupleTo4Uint32(item))
        }
    }
    return result
}

// --- 在merge前做类型转换 ---
func (s *CoverageFinalService) convertCoverageMapData(raw []CoverageMapWithFilePath) []struct {
	StatementMap        map[uint32][4]uint32
	FnMap               map[uint32]models.FunctionMapEntry
	BranchMap           map[uint32]models.BranchMapEntry
	RestoreStatementMap map[uint32][4]uint32
	RestoreFnMap        map[uint32]models.FunctionMapEntry
	RestoreBranchMap    map[uint32]models.BranchMapEntry
	CoverageMapHashID   string
	FullFilePath        string
} {
	var result []struct {
		StatementMap        map[uint32][4]uint32
		FnMap               map[uint32]models.FunctionMapEntry
		BranchMap           map[uint32]models.BranchMapEntry
		RestoreStatementMap map[uint32][4]uint32
		RestoreFnMap        map[uint32]models.FunctionMapEntry
		RestoreBranchMap    map[uint32]models.BranchMapEntry
		CoverageMapHashID   string
		FullFilePath        string
	}
	for _, item := range raw {
		parsedItem, err := s.parseCoverageMapFromJSON(item)
		if err != nil {
			fmt.Printf("Warning: failed to parse coverage map for %s: %v\n", item.CoverageMapHashID, err)
			continue
		}
		result = append(result, parsedItem)
	}
	return result
}

// tupleToMapUint32 converts Tuple(Array(UInt32), Array(UInt64)) to map[uint32]uint32
func tupleToMapUint32(val []interface{}) map[uint32]uint32 {
    result := make(map[uint32]uint32)
    if len(val) != 2 {
        return result
    }
    // 尝试直接类型断言
    if keys, ok1 := val[0].([]uint32); ok1 {
        if values, ok2 := val[1].([]uint64); ok2 {
            for i := 0; i < len(keys) && i < len(values); i++ {
                result[keys[i]] = uint32(values[i])
            }
            return result
        }
    }
    // 兼容驱动返回[]interface{}
    keysAny, ok1 := val[0].([]interface{})
    valuesAny, ok2 := val[1].([]interface{})
    if ok1 && ok2 {
        for i := 0; i < len(keysAny) && i < len(valuesAny); i++ {
            k := toUint32(keysAny[i])
            v := toUint32(valuesAny[i])
            result[k] = v
        }
    }
    return result
}

// convertHitResult converts []CoverageHitResult to []struct{...S/F/B为map}
func convertHitResult(raw []CoverageHitResult) []struct {
    FullFilePath string
    S            map[uint32]uint32
    F            map[uint32]uint32
    B            map[uint32]uint32
} {
    var result []struct {
        FullFilePath string
        S            map[uint32]uint32
        F            map[uint32]uint32
        B            map[uint32]uint32
    }
    for _, item := range raw {
        result = append(result, struct {
            FullFilePath string
            S            map[uint32]uint32
            F            map[uint32]uint32
            B            map[uint32]uint32
        }{
            FullFilePath: item.FullFilePath,
            S:            tupleToMapUint32(item.S),
            F:            tupleToMapUint32(item.F),
            B:            tupleToMapUint32(item.B),
        })
    }
    return result
}

// parseCoverageMapFromJSON 解析 JSON 字符串并转换为相应的数据结构
func (s *CoverageFinalService) parseCoverageMapFromJSON(item CoverageMapWithFilePath) (struct {
	StatementMap        map[uint32][4]uint32
	FnMap               map[uint32]models.FunctionMapEntry
	BranchMap           map[uint32]models.BranchMapEntry
	RestoreStatementMap map[uint32][4]uint32
	RestoreFnMap        map[uint32]models.FunctionMapEntry
	RestoreBranchMap    map[uint32]models.BranchMapEntry
	CoverageMapHashID   string
	FullFilePath        string
}, error) {
	result := struct {
		StatementMap        map[uint32][4]uint32
		FnMap               map[uint32]models.FunctionMapEntry
		BranchMap           map[uint32]models.BranchMapEntry
		RestoreStatementMap map[uint32][4]uint32
		RestoreFnMap        map[uint32]models.FunctionMapEntry
		RestoreBranchMap    map[uint32]models.BranchMapEntry
		CoverageMapHashID   string
		FullFilePath        string
	}{
		CoverageMapHashID: item.CoverageMapHashID,
		FullFilePath:      item.FullFilePath,
	}

	// 解析 StatementMap
	if item.StatementMap != "" && item.StatementMap != "{}" {
		statementMap, err := s.parseClickHouseMap(item.StatementMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse StatementMap '%s': %v\n", item.StatementMap, err)
			result.StatementMap = make(map[uint32][4]uint32)
		} else {
			result.StatementMap = make(map[uint32][4]uint32)
			for k, v := range statementMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if tuple, ok := v.([4]uint32); ok {
						result.StatementMap[uint32(key)] = tuple
					}
				}
			}
		}
	} else {
		result.StatementMap = make(map[uint32][4]uint32)
	}

	// 解析 FnMap
	if item.FnMap != "" && item.FnMap != "{}" {
		fnMap, err := s.parseClickHouseMap(item.FnMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse FnMap '%s': %v\n", item.FnMap, err)
			result.FnMap = make(map[uint32]models.FunctionMapEntry)
		} else {
			result.FnMap = make(map[uint32]models.FunctionMapEntry)
			for k, v := range fnMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if fnEntry, err := s.parseFunctionMapEntry(v); err == nil {
						result.FnMap[uint32(key)] = fnEntry
					}
				}
			}
		}
	} else {
		result.FnMap = make(map[uint32]models.FunctionMapEntry)
	}

	// 解析 BranchMap
	if item.BranchMap != "" && item.BranchMap != "{}" {
		branchMap, err := s.parseClickHouseMap(item.BranchMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse BranchMap '%s': %v\n", item.BranchMap, err)
			result.BranchMap = make(map[uint32]models.BranchMapEntry)
		} else {
			result.BranchMap = make(map[uint32]models.BranchMapEntry)
			for k, v := range branchMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if branchEntry, err := s.parseBranchMapEntry(v); err == nil {
						result.BranchMap[uint32(key)] = branchEntry
					}
				}
			}
		}
	} else {
		result.BranchMap = make(map[uint32]models.BranchMapEntry)
	}

	// 解析 RestoreStatementMap
	if item.RestoreStatementMap != "" && item.RestoreStatementMap != "{}" {
		restoreStatementMap, err := s.parseClickHouseMap(item.RestoreStatementMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse RestoreStatementMap '%s': %v\n", item.RestoreStatementMap, err)
			result.RestoreStatementMap = make(map[uint32][4]uint32)
		} else {
			result.RestoreStatementMap = make(map[uint32][4]uint32)
			for k, v := range restoreStatementMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if tuple, ok := v.([4]uint32); ok {
						result.RestoreStatementMap[uint32(key)] = tuple
					}
				}
			}
		}
	} else {
		result.RestoreStatementMap = make(map[uint32][4]uint32)
	}

	// 解析 RestoreFnMap
	if item.RestoreFnMap != "" && item.RestoreFnMap != "{}" {
		restoreFnMap, err := s.parseClickHouseMap(item.RestoreFnMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse RestoreFnMap '%s': %v\n", item.RestoreFnMap, err)
			result.RestoreFnMap = make(map[uint32]models.FunctionMapEntry)
		} else {
			result.RestoreFnMap = make(map[uint32]models.FunctionMapEntry)
			for k, v := range restoreFnMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if fnEntry, err := s.parseFunctionMapEntry(v); err == nil {
						result.RestoreFnMap[uint32(key)] = fnEntry
					}
				}
			}
		}
	} else {
		result.RestoreFnMap = make(map[uint32]models.FunctionMapEntry)
	}

	// 解析 RestoreBranchMap
	if item.RestoreBranchMap != "" && item.RestoreBranchMap != "{}" {
		restoreBranchMap, err := s.parseClickHouseMap(item.RestoreBranchMap)
		if err != nil {
			fmt.Printf("Warning: failed to parse RestoreBranchMap '%s': %v\n", item.RestoreBranchMap, err)
			result.RestoreBranchMap = make(map[uint32]models.BranchMapEntry)
		} else {
			result.RestoreBranchMap = make(map[uint32]models.BranchMapEntry)
			for k, v := range restoreBranchMap {
				if key, err := strconv.ParseUint(k, 10, 32); err == nil {
					if branchEntry, err := s.parseBranchMapEntry(v); err == nil {
						result.RestoreBranchMap[uint32(key)] = branchEntry
					}
				}
			}
		}
	} else {
		result.RestoreBranchMap = make(map[uint32]models.BranchMapEntry)
	}

	return result, nil
}

// parseClickHouseMap 解析 ClickHouse 的特殊 Map 格式
// 例如: {0:(1,36,85,10), 1:(2,37,86,11)} -> map[string]interface{}
func (s *CoverageFinalService) parseClickHouseMap(input string) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	
	// 移除开头和结尾的大括号
	input = strings.TrimSpace(input)
	if !strings.HasPrefix(input, "{") || !strings.HasSuffix(input, "}") {
		return nil, fmt.Errorf("invalid format: must start with { and end with }")
	}
	
	input = input[1 : len(input)-1] // 移除 { 和 }
	if input == "" {
		return result, nil
	}
	
	// 分割键值对
	pairs := s.splitClickHousePairs(input)
	for _, pair := range pairs {
		key, value, err := s.parseClickHousePair(pair)
		if err != nil {
			return nil, fmt.Errorf("failed to parse pair '%s': %v", pair, err)
		}
		result[key] = value
	}
	
	return result, nil
}

// splitClickHousePairs 分割 ClickHouse Map 的键值对
func (s *CoverageFinalService) splitClickHousePairs(input string) []string {
	var pairs []string
	var current string
	var parenCount int
	var inString bool
	var escapeNext bool
	
	for i := 0; i < len(input); i++ {
		char := input[i]
		
		if escapeNext {
			current += string(char)
			escapeNext = false
			continue
		}
		
		if char == '\\' {
			escapeNext = true
			current += string(char)
			continue
		}
		
		if char == '\'' && !escapeNext {
			inString = !inString
			current += string(char)
			continue
		}
		
		if !inString {
			if char == '(' {
				parenCount++
			} else if char == ')' {
				parenCount--
			} else if char == ',' && parenCount == 0 {
				pairs = append(pairs, strings.TrimSpace(current))
				current = ""
				continue
			}
		}
		
		current += string(char)
	}
	
	if current != "" {
		pairs = append(pairs, strings.TrimSpace(current))
	}
	
	return pairs
}

// parseClickHousePair 解析单个键值对
func (s *CoverageFinalService) parseClickHousePair(pair string) (string, interface{}, error) {
	// 找到第一个冒号
	colonIndex := -1
	var parenCount int
	var inString bool
	var escapeNext bool
	
	for i := 0; i < len(pair); i++ {
		char := pair[i]
		
		if escapeNext {
			escapeNext = false
			continue
		}
		
		if char == '\\' {
			escapeNext = true
			continue
		}
		
		if char == '\'' && !escapeNext {
			inString = !inString
			continue
		}
		
		if !inString && char == ':' && parenCount == 0 {
			colonIndex = i
			break
		}
		
		if !inString {
			if char == '(' {
				parenCount++
			} else if char == ')' {
				parenCount--
			}
		}
	}
	
	if colonIndex == -1 {
		return "", nil, fmt.Errorf("no colon found in pair")
	}
	
	key := strings.TrimSpace(pair[:colonIndex])
	valueStr := strings.TrimSpace(pair[colonIndex+1:])
	
	// 解析值
	value, err := s.parseClickHouseValue(valueStr)
	if err != nil {
		return "", nil, fmt.Errorf("failed to parse value '%s': %v", valueStr, err)
	}
	
	return key, value, nil
}

// parseClickHouseValue 解析 ClickHouse 的值
func (s *CoverageFinalService) parseClickHouseValue(valueStr string) (interface{}, error) {
	valueStr = strings.TrimSpace(valueStr)
	
	// 检查是否是元组 (a,b,c,d)
	if strings.HasPrefix(valueStr, "(") && strings.HasSuffix(valueStr, ")") {
		return s.parseClickHouseTuple(valueStr[1 : len(valueStr)-1])
	}
	
	// 检查是否是数组 [a,b,c,d]
	if strings.HasPrefix(valueStr, "[") && strings.HasSuffix(valueStr, "]") {
		return s.parseClickHouseArray(valueStr[1 : len(valueStr)-1])
	}
	
	// 检查是否是字符串 'string'
	if strings.HasPrefix(valueStr, "'") && strings.HasSuffix(valueStr, "'") {
		return valueStr[1 : len(valueStr)-1], nil
	}
	
	// 尝试解析为数字
	if val, err := strconv.ParseUint(valueStr, 10, 32); err == nil {
		return uint32(val), nil
	}
	
	return valueStr, nil
}

// parseClickHouseTuple 解析 ClickHouse 元组
func (s *CoverageFinalService) parseClickHouseTuple(tupleStr string) (interface{}, error) {
	elements := s.splitClickHouseElements(tupleStr)
	
	// 检查是否是 4 个 uint32 的元组
	if len(elements) == 4 {
		var result [4]uint32
		for i, elem := range elements {
			if val, err := strconv.ParseUint(strings.TrimSpace(elem), 10, 32); err == nil {
				result[i] = uint32(val)
			} else {
				return nil, fmt.Errorf("failed to parse tuple element '%s' as uint32", elem)
			}
		}
		return result, nil
	}
	
	// 其他情况，返回字符串数组
	var result []string
	for _, elem := range elements {
		result = append(result, strings.TrimSpace(elem))
	}
	return result, nil
}

// parseClickHouseArray 解析 ClickHouse 数组
func (s *CoverageFinalService) parseClickHouseArray(arrayStr string) (interface{}, error) {
	elements := s.splitClickHouseElements(arrayStr)
	
	// 检查是否是元组数组
	if len(elements) > 0 && strings.HasPrefix(strings.TrimSpace(elements[0]), "(") {
		var result [][4]uint32
		for _, elem := range elements {
			if tuple, err := s.parseClickHouseTuple(strings.TrimSpace(elem)[1 : len(strings.TrimSpace(elem))-1]); err == nil {
				if tuple4, ok := tuple.([4]uint32); ok {
					result = append(result, tuple4)
				}
			}
		}
		return result, nil
	}
	
	// 其他情况，返回字符串数组
	var result []string
	for _, elem := range elements {
		result = append(result, strings.TrimSpace(elem))
	}
	return result, nil
}

// splitClickHouseElements 分割 ClickHouse 元组或数组的元素
func (s *CoverageFinalService) splitClickHouseElements(input string) []string {
	var elements []string
	var current string
	var parenCount int
	var inString bool
	var escapeNext bool
	
	for i := 0; i < len(input); i++ {
		char := input[i]
		
		if escapeNext {
			current += string(char)
			escapeNext = false
			continue
		}
		
		if char == '\\' {
			escapeNext = true
			current += string(char)
			continue
		}
		
		if char == '\'' && !escapeNext {
			inString = !inString
			current += string(char)
			continue
		}
		
		if !inString {
			if char == '(' {
				parenCount++
			} else if char == ')' {
				parenCount--
			} else if char == ',' && parenCount == 0 {
				elements = append(elements, strings.TrimSpace(current))
				current = ""
				continue
			}
		}
		
		current += string(char)
	}
	
	if current != "" {
		elements = append(elements, strings.TrimSpace(current))
	}
	
	return elements
}

// parseFunctionMapEntry 解析 FunctionMapEntry
func (s *CoverageFinalService) parseFunctionMapEntry(value interface{}) (models.FunctionMapEntry, error) {
	var result models.FunctionMapEntry
	
	// 检查是否是数组格式
	if arr, ok := value.([]string); ok && len(arr) >= 4 {
		result.Name = arr[0]
		if line, err := strconv.ParseUint(arr[1], 10, 32); err == nil {
			result.Line = uint32(line)
		}
		if startLoc, err := s.parseTuple4(arr[2]); err == nil {
			result.StartLoc = startLoc
		}
		if endLoc, err := s.parseTuple4(arr[3]); err == nil {
			result.EndLoc = endLoc
		}
		return result, nil
	}
	
	return result, fmt.Errorf("invalid FunctionMapEntry format")
}

// parseBranchMapEntry 解析 BranchMapEntry
func (s *CoverageFinalService) parseBranchMapEntry(value interface{}) (models.BranchMapEntry, error) {
	var result models.BranchMapEntry
	
	// 检查是否是数组格式
	if arr, ok := value.([]string); ok && len(arr) >= 4 {
		if branchType, err := strconv.ParseUint(arr[0], 10, 8); err == nil {
			result.Type = uint8(branchType)
		}
		if line, err := strconv.ParseUint(arr[1], 10, 32); err == nil {
			result.Line = uint32(line)
		}
		if loc, err := s.parseTuple4(arr[2]); err == nil {
			result.Loc = loc
		}
		if locations, err := s.parseTupleArray(arr[3]); err == nil {
			result.Locations = locations
		}
		return result, nil
	}
	
	return result, fmt.Errorf("invalid BranchMapEntry format")
}

// parseTuple4 解析 4 元组
func (s *CoverageFinalService) parseTuple4(value interface{}) ([4]uint32, error) {
	var result [4]uint32
	
	if tuple, ok := value.([4]uint32); ok {
		return tuple, nil
	}
	
	if arr, ok := value.([]string); ok && len(arr) == 4 {
		for i, elem := range arr {
			if val, err := strconv.ParseUint(elem, 10, 32); err == nil {
				result[i] = uint32(val)
			}
		}
		return result, nil
	}
	
	return result, fmt.Errorf("invalid tuple4 format")
}

// parseTupleArray 解析元组数组
func (s *CoverageFinalService) parseTupleArray(value interface{}) ([][4]uint32, error) {
	var result [][4]uint32
	
	if tupleArray, ok := value.([][4]uint32); ok {
		return tupleArray, nil
	}
	
	if arr, ok := value.([]string); ok {
		for _, elem := range arr {
			if tuple, err := s.parseTuple4(elem); err == nil {
				result = append(result, tuple)
			}
		}
		return result, nil
	}
	
	return result, fmt.Errorf("invalid tuple array format")
}
