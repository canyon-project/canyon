package utils

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