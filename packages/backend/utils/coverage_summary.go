package utils

import (
    "encoding/json"
)

// GenSummaryMapByCoverageMap 根据覆盖率映射生成摘要映射
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

// getChangeStatus 获取变更状态
func getChangeStatus(fileCoverage map[string]interface{}) bool {
    if change, ok := fileCoverage["change"].(bool); ok {
        return change
    }
    return false
}