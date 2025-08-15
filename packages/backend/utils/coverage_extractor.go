package utils

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