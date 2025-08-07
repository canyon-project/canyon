package utils

import (
    "encoding/json"
    "fmt"
    "math"
    "reflect"
)

// CoverageSummaryData 覆盖率摘要数据结构
type CoverageSummaryData struct {
    Lines           CoverageTotals `json:"lines"`
    Statements      CoverageTotals `json:"statements"`
    Branches        CoverageTotals `json:"branches"`
    Functions       CoverageTotals `json:"functions"`
    BranchesTrue    CoverageTotals `json:"branchesTrue"`
    Newlines        CoverageTotals `json:"newlines"`
    ChangeBranches  CoverageTotals `json:"changebranches"`
    ChangeFunctions CoverageTotals `json:"changefunctions"`
}

// CoverageTotals 覆盖率总计数据
type CoverageTotals struct {
    Total   int     `json:"total"`
    Covered int     `json:"covered"`
    Skipped int     `json:"skipped"`
    Pct     float64 `json:"pct"`
}

// CoverageSummaryDataMap 覆盖率摘要数据映射
type CoverageSummaryDataMap map[string]CoverageSummaryDataWithPath

// CoverageSummaryDataWithPath 带路径的覆盖率摘要数据
type CoverageSummaryDataWithPath struct {
    CoverageSummaryData
    Path   string `json:"path"`
    Change bool   `json:"change"`
}

// GenSummaryMapByCoverageMap 根据覆盖率映射生成摘要映射
// 参考 canyon-data 包中 genSummaryMapByCoverageMap 的功能
func GenSummaryMapByCoverageMap(coverageMap interface{}) CoverageSummaryDataMap {
    summaryMap := make(CoverageSummaryDataMap)

    // 将 coverageMap 转换为 map[string]interface{} 格式
    coverageMapData, ok := coverageMap.(map[string]interface{})
    if !ok {
        // 如果不是 map[string]interface{}，尝试通过 JSON 转换
        jsonData, err := json.Marshal(coverageMap)
        if err != nil {
            return summaryMap
        }
        err = json.Unmarshal(jsonData, &coverageMapData)
        if err != nil {
            return summaryMap
        }
    }

    // 遍历每个文件的覆盖率数据
    for filePath, fileData := range coverageMapData {
        fileCoverage, ok := fileData.(map[string]interface{})
        if !ok {
            continue
        }
        // 检查是否已经是计算好的覆盖率数据
        if isPreCalculatedCoverage(fileCoverage) {
            // 直接使用已经计算好的覆盖率数据
            summary := extractPreCalculatedCoverage(fileCoverage)
            summaryWithPath := CoverageSummaryDataWithPath{
                CoverageSummaryData: summary,
                Path:                filePath,
                Change:              getChangeStatus(fileCoverage),
            }
            summaryMap[filePath] = summaryWithPath
        } else {
            // 计算各种覆盖率统计
            summary := calculateFileCoverageSummary(fileCoverage)
            summaryWithPath := CoverageSummaryDataWithPath{
                CoverageSummaryData: summary,
                Path:                filePath,
                Change:              false, // 暂时设为 false，后续可以根据需要添加代码变更检测
            }
            summaryMap[filePath] = summaryWithPath
        }
    }

    return summaryMap
}

// isPreCalculatedCoverage 检查是否已经是计算好的覆盖率数据
func isPreCalculatedCoverage(fileCoverage map[string]interface{}) bool {
    // 检查是否包含 lines, statements, branches, functions 等字段
    _, hasLines := fileCoverage["lines"]
    _, hasStatements := fileCoverage["statements"]
    _, hasBranches := fileCoverage["branches"]
    _, hasFunctions := fileCoverage["functions"]

    return hasLines && hasStatements && hasBranches && hasFunctions
}

// extractPreCalculatedCoverage 提取已经计算好的覆盖率数据
func extractPreCalculatedCoverage(fileCoverage map[string]interface{}) CoverageSummaryData {
    summary := CoverageSummaryData{}

    // 提取各种覆盖率数据
    if linesData, ok := fileCoverage["lines"].(map[string]interface{}); ok {
        summary.Lines = extractCoverageTotals(linesData)
    }

    if statementsData, ok := fileCoverage["statements"].(map[string]interface{}); ok {
        summary.Statements = extractCoverageTotals(statementsData)
    }

    if branchesData, ok := fileCoverage["branches"].(map[string]interface{}); ok {
        summary.Branches = extractCoverageTotals(branchesData)
    }

    if functionsData, ok := fileCoverage["functions"].(map[string]interface{}); ok {
        summary.Functions = extractCoverageTotals(functionsData)
    }

    if branchesTrueData, ok := fileCoverage["branchesTrue"].(map[string]interface{}); ok {
        summary.BranchesTrue = extractCoverageTotals(branchesTrueData)
    } else {
        // 如果没有 branchesTrue，使用 branches 的数据
        summary.BranchesTrue = summary.Branches
    }

    if newlinesData, ok := fileCoverage["newlines"].(map[string]interface{}); ok {
        summary.Newlines = extractCoverageTotals(newlinesData)
    }

    if changeBranchesData, ok := fileCoverage["changebranches"].(map[string]interface{}); ok {
        summary.ChangeBranches = extractCoverageTotals(changeBranchesData)
    }

    if changeFunctionsData, ok := fileCoverage["changefunctions"].(map[string]interface{}); ok {
        summary.ChangeFunctions = extractCoverageTotals(changeFunctionsData)
    }

    return summary
}

// extractCoverageTotals 从 map[string]interface{} 中提取 CoverageTotals
func extractCoverageTotals(data map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    if total, ok := data["total"]; ok {
        if totalInt, ok := total.(int); ok {
            totals.Total = totalInt
        } else if totalFloat, ok := total.(float64); ok {
            totals.Total = int(totalFloat)
        }
    }

    if covered, ok := data["covered"]; ok {
        if coveredInt, ok := covered.(int); ok {
            totals.Covered = coveredInt
        } else if coveredFloat, ok := covered.(float64); ok {
            totals.Covered = int(coveredFloat)
        }
    }

    if skipped, ok := data["skipped"]; ok {
        if skippedInt, ok := skipped.(int); ok {
            totals.Skipped = skippedInt
        } else if skippedFloat, ok := skipped.(float64); ok {
            totals.Skipped = int(skippedFloat)
        }
    }

    if pct, ok := data["pct"]; ok {
        if pctFloat, ok := pct.(float64); ok {
            totals.Pct = pctFloat
        } else if pctInt, ok := pct.(int); ok {
            totals.Pct = float64(pctInt)
        }
    }

    return totals
}

// getChangeStatus 获取变更状态
func getChangeStatus(fileCoverage map[string]interface{}) bool {
    if change, ok := fileCoverage["change"].(bool); ok {
        return change
    }
    return false
}

// calculateFileCoverageSummary 计算单个文件的覆盖率摘要
func calculateFileCoverageSummary(fileCoverage map[string]interface{}) CoverageSummaryData {
    summary := CoverageSummaryData{}

    // 计算语句覆盖率
    summary.Statements = calculateStatementsCoverage(fileCoverage)

    // 计算函数覆盖率
    summary.Functions = calculateFunctionsCoverage(fileCoverage)

    // 计算分支覆盖率
    summary.Branches = calculateBranchesCoverage(fileCoverage)

    // 计算行覆盖率（基于语句覆盖率）
    summary.Lines = calculateLinesCoverage(fileCoverage)

    // 分支真值覆盖率（暂时与分支覆盖率相同）
    summary.BranchesTrue = summary.Branches

    // 新行覆盖率（暂时为空）
    summary.Newlines = CoverageTotals{}

    // 变更分支覆盖率（暂时为空）
    summary.ChangeBranches = CoverageTotals{}

    // 变更函数覆盖率（暂时为空）
    summary.ChangeFunctions = CoverageTotals{}

    return summary
}

// calculateStatementsCoverage 计算语句覆盖率
func calculateStatementsCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    // 获取语句命中数据
    sData, ok := fileCoverage["s"]
    if !ok {
        return totals
    }

    // 计算语句覆盖率
    switch s := sData.(type) {
    case map[uint32]uint32:
        total := len(s)
        covered := 0
        for _, hits := range s {
            if hits > 0 {
                covered++
            }
        }
        totals.Total = total
        totals.Covered = covered
        totals.Skipped = 0
        if total > 0 {
            totals.Pct = float64(covered) / float64(total) * 100
        } else {
            totals.Pct = 100.0
        }
        totals.Pct = math.Round(totals.Pct*100) / 100
    case map[string]interface{}:
        // 处理 OrderedMap 类型
        if keys, ok := s["Keys"].([]string); ok {
            total := len(keys)
            covered := 0
            if values, ok := s["Values"].(map[string]uint32); ok {
                for _, key := range keys {
                    if hits, exists := values[key]; exists && hits > 0 {
                        covered++
                    }
                }
            }
            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    case []interface{}:
        // 处理包含键数组和值映射的结构
        if len(s) == 2 {
            // 第一个元素是键的数组
            keysData, ok := s[0].([]interface{})
            if !ok {
                return totals
            }

            // 第二个元素是值的映射
            valuesData, ok := s[1].(map[string]interface{})
            if !ok {
                return totals
            }

            total := len(keysData)
            covered := 0

            for _, key := range keysData {
                keyStr := fmt.Sprintf("%v", key)
                if value, exists := valuesData[keyStr]; exists {
                    if hits, ok := value.(uint32); ok && hits > 0 {
                        covered++
                    } else if hits, ok := value.(int); ok && hits > 0 {
                        covered++
                    } else if hits, ok := value.(float64); ok && hits > 0 {
                        covered++
                    }
                }
            }

            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    default:
        // 处理 services.OrderedMap 类型
        val := reflect.ValueOf(sData)

        if val.Kind() == reflect.Struct {
            // 检查是否有 Keys 和 Values 字段
            keysField := val.FieldByName("Keys")
            valuesField := val.FieldByName("Values")

            if keysField.IsValid() && valuesField.IsValid() {
                // 获取 Keys 字段
                keys := keysField.Interface()

                if keysSlice, ok := keys.([]string); ok {
                    total := len(keysSlice)
                    covered := 0

                    // 获取 Values 字段
                    values := valuesField.Interface()

                    if valuesMap, ok := values.(map[string]uint32); ok {
                        for _, key := range keysSlice {
                            if hits, exists := valuesMap[key]; exists && hits > 0 {
                                covered++
                            }
                        }
                    }

                    totals.Total = total
                    totals.Covered = covered
                    totals.Skipped = 0
                    if total > 0 {
                        totals.Pct = float64(covered) / float64(total) * 100
                    } else {
                        totals.Pct = 100.0
                    }
                    totals.Pct = math.Round(totals.Pct*100) / 100
                }
            }
        }
    }

    return totals
}

// calculateFunctionsCoverage 计算函数覆盖率
func calculateFunctionsCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    // 获取函数命中数据
    fData, ok := fileCoverage["f"]
    if !ok {
        return totals
    }

    // 计算函数覆盖率
    switch f := fData.(type) {
    case map[uint32]uint32:
        total := len(f)
        covered := 0
        for _, hits := range f {
            if hits > 0 {
                covered++
            }
        }
        totals.Total = total
        totals.Covered = covered
        totals.Skipped = 0
        if total > 0 {
            totals.Pct = float64(covered) / float64(total) * 100
        } else {
            totals.Pct = 100.0
        }
        totals.Pct = math.Round(totals.Pct*100) / 100
    case map[string]interface{}:
        // 处理 OrderedMap 类型
        if keys, ok := f["Keys"].([]string); ok {
            total := len(keys)
            covered := 0
            if values, ok := f["Values"].(map[string]uint32); ok {
                for _, key := range keys {
                    if hits, exists := values[key]; exists && hits > 0 {
                        covered++
                    }
                }
            }
            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    case []interface{}:
        // 处理包含键数组和值映射的结构
        if len(f) == 2 {
            // 第一个元素是键的数组
            keysData, ok := f[0].([]interface{})
            if !ok {
                return totals
            }

            // 第二个元素是值的映射
            valuesData, ok := f[1].(map[string]interface{})
            if !ok {
                return totals
            }

            total := len(keysData)
            covered := 0

            for _, key := range keysData {
                keyStr := fmt.Sprintf("%v", key)
                if value, exists := valuesData[keyStr]; exists {
                    if hits, ok := value.(uint32); ok && hits > 0 {
                        covered++
                    } else if hits, ok := value.(int); ok && hits > 0 {
                        covered++
                    } else if hits, ok := value.(float64); ok && hits > 0 {
                        covered++
                    }
                }
            }

            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    default:
        // 处理 services.OrderedMap 类型
        val := reflect.ValueOf(fData)
        if val.Kind() == reflect.Struct {
            // 检查是否有 Keys 和 Values 字段
            keysField := val.FieldByName("Keys")
            valuesField := val.FieldByName("Values")

            if keysField.IsValid() && valuesField.IsValid() {
                // 获取 Keys 字段
                keys := keysField.Interface()
                if keysSlice, ok := keys.([]string); ok {
                    total := len(keysSlice)
                    covered := 0

                    // 获取 Values 字段
                    values := valuesField.Interface()
                    if valuesMap, ok := values.(map[string]uint32); ok {
                        for _, key := range keysSlice {
                            if hits, exists := valuesMap[key]; exists && hits > 0 {
                                covered++
                            }
                        }
                    }

                    totals.Total = total
                    totals.Covered = covered
                    totals.Skipped = 0
                    if total > 0 {
                        totals.Pct = float64(covered) / float64(total) * 100
                    } else {
                        totals.Pct = 100.0
                    }
                    totals.Pct = math.Round(totals.Pct*100) / 100
                }
            }
        }
    }

    return totals
}

// calculateBranchesCoverage 计算分支覆盖率
func calculateBranchesCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    // 获取分支命中数据
    bData, ok := fileCoverage["b"]
    if !ok {
        return totals
    }

    // 计算分支覆盖率
    switch b := bData.(type) {
    case map[uint32][]uint32:
        total := 0
        covered := 0
        for _, branchHits := range b {
            total += len(branchHits)
            for _, hits := range branchHits {
                if hits > 0 {
                    covered++
                }
            }
        }
        totals.Total = total
        totals.Covered = covered
        totals.Skipped = 0
        if total > 0 {
            totals.Pct = float64(covered) / float64(total) * 100
        } else {
            totals.Pct = 100.0
        }
        totals.Pct = math.Round(totals.Pct*100) / 100
    case map[string]interface{}:
        // 处理 OrderedMap 类型
        if keys, ok := b["Keys"].([]string); ok {
            total := 0
            covered := 0
            if values, ok := b["Values"].(map[string][]uint32); ok {
                for _, key := range keys {
                    if branchHits, exists := values[key]; exists {
                        total += len(branchHits)
                        for _, hits := range branchHits {
                            if hits > 0 {
                                covered++
                            }
                        }
                    }
                }
            }
            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    case []interface{}:
        // 处理包含键数组和值映射的结构
        if len(b) == 2 {
            // 第一个元素是键的数组
            keysData, ok := b[0].([]interface{})
            if !ok {
                return totals
            }

            // 第二个元素是值的映射
            valuesData, ok := b[1].(map[string]interface{})
            if !ok {
                return totals
            }

            total := 0
            covered := 0

            for _, key := range keysData {
                keyStr := fmt.Sprintf("%v", key)
                if value, exists := valuesData[keyStr]; exists {
                    if branchHits, ok := value.([]uint32); ok {
                        total += len(branchHits)
                        for _, hits := range branchHits {
                            if hits > 0 {
                                covered++
                            }
                        }
                    } else if branchHits, ok := value.([]interface{}); ok {
                        total += len(branchHits)
                        for _, hits := range branchHits {
                            if hitsInt, ok := hits.(uint32); ok && hitsInt > 0 {
                                covered++
                            } else if hitsInt, ok := hits.(int); ok && hitsInt > 0 {
                                covered++
                            } else if hitsFloat, ok := hits.(float64); ok && hitsFloat > 0 {
                                covered++
                            }
                        }
                    }
                }
            }

            totals.Total = total
            totals.Covered = covered
            totals.Skipped = 0
            if total > 0 {
                totals.Pct = float64(covered) / float64(total) * 100
            } else {
                totals.Pct = 100.0
            }
            totals.Pct = math.Round(totals.Pct*100) / 100
        }
    default:
        // 处理 services.OrderedInterfaceMap 类型
        val := reflect.ValueOf(bData)
        if val.Kind() == reflect.Struct {
            // 检查是否有 Keys 和 Values 字段
            keysField := val.FieldByName("Keys")
            valuesField := val.FieldByName("Values")

            if keysField.IsValid() && valuesField.IsValid() {
                // 获取 Keys 字段
                keys := keysField.Interface()
                if keysSlice, ok := keys.([]string); ok {
                    total := 0
                    covered := 0

                    // 获取 Values 字段
                    values := valuesField.Interface()
                    if valuesMap, ok := values.(map[string][]uint32); ok {
                        for _, key := range keysSlice {
                            if branchHits, exists := valuesMap[key]; exists {
                                total += len(branchHits)
                                for _, hits := range branchHits {
                                    if hits > 0 {
                                        covered++
                                    }
                                }
                            }
                        }
                    }

                    totals.Total = total
                    totals.Covered = covered
                    totals.Skipped = 0
                    if total > 0 {
                        totals.Pct = float64(covered) / float64(total) * 100
                    } else {
                        totals.Pct = 100.0
                    }
                    totals.Pct = math.Round(totals.Pct*100) / 100
                }
            }
        }
    }

    return totals
}

// calculateLinesCoverage 计算行覆盖率
func calculateLinesCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    // 基于语句覆盖率计算行覆盖率
    statements := calculateStatementsCoverage(fileCoverage)

    // 这里需要根据实际的代码行数来计算
    // 暂时使用语句覆盖率作为行覆盖率
    return statements
}

// mergeCoverageTotals 合并两个覆盖率总计数据
func mergeCoverageTotals(first, second CoverageTotals) CoverageTotals {
    totals := CoverageTotals{}

    // 合并总数
    totals.Total = first.Total + second.Total
    totals.Covered = first.Covered + second.Covered
    totals.Skipped = first.Skipped + second.Skipped

    // 计算合并后的百分比
    if totals.Total > 0 {
        totals.Pct = float64(totals.Covered) / float64(totals.Total) * 100
        totals.Pct = math.Round(totals.Pct*100) / 100
    } else {
        totals.Pct = 100.0
    }

    return totals
}
