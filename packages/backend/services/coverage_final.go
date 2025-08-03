package services

import (
    "backend/db"
    "backend/models"
    "context"
    "encoding/json"
    "fmt"
    "strings"
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
			statement_map as statementMap,
			fn_map as fnMap,
			branch_map as branchMap,
			restore_statement_map as restoreStatementMap,
			restore_fn_map as restoreFnMap,
			restore_branch_map as restoreBranchMap,
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
            fmt.Printf("DEBUG: First row - StatementMap keys: %d\n", len(item.StatementMap))
            fmt.Printf("DEBUG: First row - FnMap keys: %d\n", len(item.FnMap))
            fmt.Printf("DEBUG: First row - BranchMap keys: %d\n", len(item.BranchMap))

            // 使用 JSON 格式打印 StatementMap
            statementMapJSON, _ := json.MarshalIndent(item.StatementMap, "", "  ")
            fmt.Printf("DEBUG: First row - StatementMap JSON:\n%s\n", string(statementMapJSON))

            // 使用 JSON 格式打印 FnMap
            fnMapJSON, _ := json.MarshalIndent(item.FnMap, "", "  ")
            fmt.Printf("DEBUG: First row - FnMap JSON:\n%s\n", string(fnMapJSON))

            // 使用 JSON 格式打印 BranchMap
            branchMapJSON, _ := json.MarshalIndent(item.BranchMap, "", "  ")
            fmt.Printf("DEBUG: First row - BranchMap JSON:\n%s\n", string(branchMapJSON))
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
    StatementMap        map[uint32][4]uint32               `json:"statementMap"`
    FnMap               map[uint32]models.FunctionMapEntry `json:"fnMap"`
    BranchMap           map[uint32]models.BranchMapEntry   `json:"branchMap"`
    RestoreStatementMap map[uint32][4]uint32               `json:"restoreStatementMap"`
    RestoreFnMap        map[uint32]models.FunctionMapEntry `json:"restoreFnMap"`
    RestoreBranchMap    map[uint32]models.BranchMapEntry   `json:"restoreBranchMap"`
    CoverageMapHashID   string                             `json:"coverageMapHashID"`
    FullFilePath        string                             `json:"fullFilePath"`
}

// CoverageHitResult represents coverage hit result from ClickHouse
type CoverageHitResult struct {
    FullFilePath string        `json:"fullFilePath"`
    S            []interface{} `json:"s"`
    F            []interface{} `json:"f"`
    B            []interface{} `json:"b"`
}

// --- 转换函数 ---
func convertStatementMap(raw map[uint32][4]uint32) map[uint32][4]uint32 {
    result := make(map[uint32][4]uint32)
    for k, v := range raw {
        result[k] = v
    }
    return result
}

func convertFnMap(raw map[uint32]models.FunctionMapEntry) map[uint32]models.FunctionMapEntry {
    return raw
}

func convertBranchMap(raw map[uint32]models.BranchMapEntry) map[uint32]models.BranchMapEntry {
    return raw
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
        result = append(result, struct {
            StatementMap        map[uint32][4]uint32
            FnMap               map[uint32]models.FunctionMapEntry
            BranchMap           map[uint32]models.BranchMapEntry
            RestoreStatementMap map[uint32][4]uint32
            RestoreFnMap        map[uint32]models.FunctionMapEntry
            RestoreBranchMap    map[uint32]models.BranchMapEntry
            CoverageMapHashID   string
            FullFilePath        string
        }{
            StatementMap:        convertStatementMap(item.StatementMap),
            FnMap:               convertFnMap(item.FnMap),
            BranchMap:           convertBranchMap(item.BranchMap),
            RestoreStatementMap: convertStatementMap(item.RestoreStatementMap),
            RestoreFnMap:        convertFnMap(item.RestoreFnMap),
            RestoreBranchMap:    convertBranchMap(item.RestoreBranchMap),
            CoverageMapHashID:   item.CoverageMapHashID,
            FullFilePath:        item.FullFilePath,
        })
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
