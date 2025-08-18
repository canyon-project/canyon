package utils

import (
    "fmt"
    "math"
    "reflect"
)

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

    return calculateCoverageFromData(sData)
}

// calculateFunctionsCoverage 计算函数覆盖率
func calculateFunctionsCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    // 获取函数命中数据
    fData, ok := fileCoverage["f"]
    if !ok {
        return totals
    }

    return calculateCoverageFromData(fData)
}

// calculateBranchesCoverage 计算分支覆盖率
func calculateBranchesCoverage(fileCoverage map[string]interface{}) CoverageTotals {
    totals := CoverageTotals{}

    // 获取分支命中数据
    bData, ok := fileCoverage["b"]
    if !ok {
        return totals
    }

    // 分支覆盖率计算比较复杂，需要考虑每个分支的多个路径
    switch b := bData.(type) {
    case map[string]interface{}:
        // 处理 OrderedInterfaceMap 类型
        if keys, ok := b["Keys"].([]string); ok {
            total := 0
            covered := 0
            if values, ok := b["Values"].(map[string]interface{}); ok {
                for _, key := range keys {
                    if branchData, exists := values[key]; exists {
                        if branchArray, ok := branchData.([]uint32); ok {
                            // 每个分支有多个路径
                            total += len(branchArray)
                            for _, hits := range branchArray {
                                if hits > 0 {
                                    covered++
                                }
                            }
                        } else if branchArray, ok := branchData.([]interface{}); ok {
                            // 处理 []interface{} 类型
                            total += len(branchArray)
                            for _, hits := range branchArray {
                                if hitsUint, ok := hits.(uint32); ok && hitsUint > 0 {
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
        // 处理其他类型
        val := reflect.ValueOf(bData)
        if val.Kind() == reflect.Struct {
            // 检查是否有 Keys 和 Values 字段
            keysField := val.FieldByName("Keys")
            valuesField := val.FieldByName("Values")

            if keysField.IsValid() && valuesField.IsValid() {
                keys := keysField.Interface()
                if keysSlice, ok := keys.([]string); ok {
                    total := 0
                    covered := 0
                    values := valuesField.Interface()
                    if valuesMap, ok := values.(map[string]interface{}); ok {
                        for _, key := range keysSlice {
                            if branchData, exists := valuesMap[key]; exists {
                                if branchArray, ok := branchData.([]uint32); ok {
                                    total += len(branchArray)
                                    for _, hits := range branchArray {
                                        if hits > 0 {
                                            covered++
                                        }
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
    return statements
}

// calculateCoverageFromData 从数据中计算覆盖率
func calculateCoverageFromData(data interface{}) CoverageTotals {
    totals := CoverageTotals{}

    switch d := data.(type) {
    case map[uint32]uint32:
        total := len(d)
        covered := 0
        for _, hits := range d {
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
        if keys, ok := d["Keys"].([]string); ok {
            total := len(keys)
            covered := 0
            if values, ok := d["Values"].(map[string]uint32); ok {
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
        if len(d) == 2 {
            keysData, ok := d[0].([]interface{})
            if !ok {
                return totals
            }

            valuesData, ok := d[1].(map[string]interface{})
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
        val := reflect.ValueOf(data)

        if val.Kind() == reflect.Struct {
            keysField := val.FieldByName("Keys")
            valuesField := val.FieldByName("Values")

            if keysField.IsValid() && valuesField.IsValid() {
                keys := keysField.Interface()

                if keysSlice, ok := keys.([]string); ok {
                    total := len(keysSlice)
                    covered := 0

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
