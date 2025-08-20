package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

// Position 表示基于 Istanbul 覆盖率坐标的源码位置（1 基行号）
type Position struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}

// Loc 表示一个源码区间 [start, end)
type Loc struct {
	Start Position `json:"start"`
	End   Position `json:"end"`
}

// FnMapEntry 表示一个函数在覆盖率中的映射信息
type FnMapEntry struct {
	Name string `json:"name"`
	Decl Loc    `json:"decl"`
	Loc  Loc    `json:"loc"`
}

// StatementMapEntry 表示一个语句在覆盖率中的映射信息
type StatementMapEntry struct {
	Start Position `json:"start"`
	End   Position `json:"end"`
}

// BranchMapEntry 表示一个分支在覆盖率中的映射信息
type BranchMapEntry struct {
	Type      string `json:"type"`      // "if", "switch", "cond-expr", etc.
	Line      int    `json:"line"`
	Locations []Loc  `json:"locations"` // 分支的各个位置
}

// FileCoverage 表示某个文件的覆盖率条目结构（与 Istanbul JSON 对齐的子集）
type FileCoverage struct {
	Path         string                       `json:"path"`
	StatementMap map[string]StatementMapEntry `json:"statementMap"`
	FnMap        map[string]FnMapEntry        `json:"fnMap"`
	BranchMap    map[string]BranchMapEntry    `json:"branchMap"`
	S            map[string]int               `json:"s"` // statement counters
	F            map[string]int               `json:"f"` // function counters
	B            map[string][]int             `json:"b"` // branch counters
}

// canonicalizeSnippet 对代码片段做归一化处理，以降低无关字符对哈希的影响
func canonicalizeSnippet(s string) string {
	// 移除所有空白字符（空格、制表符、换行等）
	return strings.Join(strings.Fields(s), "")
}

// sha1Hex 计算字符串的 SHA1 十六进制表示
func sha1Hex(s string) string {
	sha := sha1.Sum([]byte(s))
	return hex.EncodeToString(sha[:])
}

// computeLineStarts 计算每行起始偏移（基于 \n）
func computeLineStarts(content string) []int {
	log.Printf("[computeLineStarts] content=%s", content)
	starts := []int{0}
	for i, ch := range content {
		if ch == '\n' {
			starts = append(starts, i+1)
		}
	}
	return starts
}

// posToOffset 将 (line, column) 转换为绝对偏移
func posToOffset(p Position, lineStarts []int) int {
	lineIdx := p.Line - 1
	if lineIdx < 0 {
		lineIdx = 0
	}
	if lineIdx >= len(lineStarts) {
		lineIdx = len(lineStarts) - 1
		if lineIdx < 0 {
			lineIdx = 0
		}
	}
	return lineStarts[lineIdx] + p.Column
}

// sliceByLoc 从文件内容中根据 Loc 提取源码片段
func sliceByLoc(content string, loc Loc, lineStarts []int) string {
	start := posToOffset(loc.Start, lineStarts)
	end := posToOffset(loc.End, lineStarts)
	if start < 0 {
		start = 0
	}
	if end < start {
		end = start
	}
	if end > len(content) {
		end = len(content)
	}
	return content[start:end]
}

// 检查两个位置对象是否相同
func isSameLoc(loc1, loc2 Loc) bool {
	return loc1.Start.Line == loc2.Start.Line &&
		loc1.Start.Column == loc2.Start.Column &&
		loc1.End.Line == loc2.End.Line &&
		loc1.End.Column == loc2.End.Column
}

// 检查两个locations数组是否结构相同
func isSameLocations(locations1, locations2 []Loc) bool {
	if len(locations1) != len(locations2) {
		return false
	}

	for i := 0; i < len(locations1); i++ {
		if !isSameLoc(locations1[i], locations2[i]) {
			return false
		}
	}

	return true
}

// buildBranchHashToIds 为分支构建"哈希 -> 分支 id 列表"的索引 (两层匹配)
func buildBranchHashToIds(entry *FileCoverage, content string) map[string][]string {
	index := make(map[string][]string)
	if entry == nil || entry.BranchMap == nil {
		return index
	}

	starts := computeLineStarts(content)
	log.Printf("[build-branch-index] starts=%v", starts)
	log.Printf("[build-branch-index] file=%s branches=%v", entry.Path, entry.BranchMap)

	for id, branch := range entry.BranchMap {
		// 第二层：对 locations 数组中每个位置提取内容并计算哈希
		var locationHashes []string
		var codeParts []string

		for i := 0; i < len(branch.Locations); i++ {
			loc := branch.Locations[i]
			code := sliceByLoc(content, loc, starts)
			canon := canonicalizeSnippet(code)
			codeHash := sha1Hex(canon)

			if i == 0 { // 只对branch 的第一个location 计算哈希
				locationHashes = append(locationHashes, codeHash)
			}
			codeParts = append(codeParts, code)
		}
		log.Printf("codeParts====> %v %v", codeParts, locationHashes)

		// 分层索引：先按 loc 分组，再按每个 location 的内容哈希分别建索引
		for i := 0; i < len(locationHashes); i++ {
			locationHash := locationHashes[i]
			indexKey := locationHash

			if index[indexKey] == nil {
				index[indexKey] = []string{}
			}
			index[indexKey] = append(index[indexKey], fmt.Sprintf("%s:%d", id, i)) // 存储 branchId:locationIndex
		}
	}

	return index
}

// mergeBranchesByHash 基于"相同分支代码哈希"进行合并 (带结构验证)
func mergeBranchesByHash(base *FileCoverage, baseContent string, other *FileCoverage, otherContent string) {
	if base == nil || other == nil {
		return
	}

	log.Printf("[merge-branch] begin file(base)=%s file(other)=%s", base.Path, other.Path)

	baseIdx := buildBranchHashToIds(base, baseContent)
	otherIdx := buildBranchHashToIds(other, otherContent)
	log.Printf("baseIdx ===>11111 %v", baseIdx)
	log.Printf("otherIdx ===>222222 %v", otherIdx)

	for hash, baseIds := range baseIdx {
		otherIds, exists := otherIdx[hash]
		if !exists || len(otherIds) == 0 {
			log.Printf("[merge-branch] hash=%s no-match", hash)
			continue
		}

		// 额外验证：确保分支结构真的相同
		for _, bidStr := range baseIds {
			// 解析 "branchId:locationIndex" 格式，提取分支ID
			parts := strings.Split(bidStr, ":")
			bid := parts[0]
			baseBranch := base.BranchMap[bid]
			structureMatched := false

			for _, oidStr := range otherIds {
				// 解析 "branchId:locationIndex" 格式，提取分支ID
				parts := strings.Split(oidStr, ":")
				oid := parts[0]
				otherBranch := other.BranchMap[oid]

				// 验证 locations 结构相同
				locationsMatched := isSameLocations(baseBranch.Locations, otherBranch.Locations)

				if locationsMatched {
					structureMatched = true
					log.Printf("[merge-branch] Structure verified: bid=%s oid=%s", bid, oid)
					break
				}
			}

			if !structureMatched {
				log.Printf("[merge-branch] Structure mismatch for bid=%s, skipping", bid)
				continue
			}

			// 执行合并
			baseBranchCounts, exists := base.B[bid]
			if exists {
				var maxOtherCounts []int

				for _, oidStr := range otherIds {
					// 解析 "branchId:locationIndex" 格式，提取分支ID
					parts := strings.Split(oidStr, ":")
					oid := parts[0]
					otherBranchCounts, exists := other.B[oid]
					if exists {
						minLen := len(baseBranchCounts)
						if len(otherBranchCounts) < minLen {
							minLen = len(otherBranchCounts)
						}

						if len(maxOtherCounts) == 0 {
							maxOtherCounts = make([]int, len(baseBranchCounts))
						}

						for i := 0; i < minLen; i++ {
							if otherBranchCounts[i] > maxOtherCounts[i] {
								maxOtherCounts[i] = otherBranchCounts[i]
							}
						}
					}
				}

				for i := 0; i < len(baseBranchCounts) && i < len(maxOtherCounts); i++ {
					before := baseBranchCounts[i]
					base.B[bid][i] = before + maxOtherCounts[i]
					log.Printf("[merge-branch] bid=%s[%d] before=%d +%d => %d", bid, i, before, maxOtherCounts[i], base.B[bid][i])
				}
			}
		}
	}

	log.Printf("[merge-branch] done file=%s", base.Path)
}

func main() {
	pull2covB := `{"/Users/sunping/Documents/canyon/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js": {"path":"/Users/sunping/Documents/canyon/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},"1":{"start":{"line":3,"column":4},"end":{"line":3,"column":17}},"2":{"start":{"line":5,"column":4},"end":{"line":5,"column":17}},"3":{"start":{"line":10,"column":2},"end":{"line":10,"column":21}},"4":{"start":{"line":14,"column":2},"end":{"line":14,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":7,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":22},"end":{"line":11,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":13,"column":16},"end":{"line":13,"column":18}},"loc":{"start":{"line":13,"column":24},"end":{"line":15,"column":1}}}},"branchMap":{"0":{"loc":{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},"type":"if","locations":[{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},{"start":{"line":4,"column":7},"end":{"line":6,"column":3}}]}},"s":{"0":1,"1":1,"2":0,"3":2,"4":1},"f":{"0":1,"1":2,"2":1},"b":{"0":[0,1]}}}`
	pull2codeB := `export function b1(x) {
  if (x > 0) {
    return x * 3;
  }else{
    return x * 4;
  }
}
  

export function b2(x) {
  return x % 2 === 0;
}

export function b3(str) {
  return String(str).toLowerCase();
}`

	pull4covB := `{"/Users/sunping/Documents/canyon/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js": {"path":"/Users/sunping/Documents/canyon/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},"1":{"start":{"line":3,"column":4},"end":{"line":3,"column":17}},"2":{"start":{"line":5,"column":4},"end":{"line":5,"column":17}},"3":{"start":{"line":10,"column":2},"end":{"line":10,"column":21}},"4":{"start":{"line":14,"column":2},"end":{"line":14,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":7,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":22},"end":{"line":11,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":13,"column":16},"end":{"line":13,"column":18}},"loc":{"start":{"line":13,"column":24},"end":{"line":15,"column":1}}}},"branchMap":{"0":{"loc":{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},"type":"if","locations":[{"start":{"line":2,"column":2},"end":{"line":6,"column":3}},{"start":{"line":4,"column":7},"end":{"line":6,"column":3}}]}},"s":{"0":1,"1":1,"2":0,"3":2,"4":1},"f":{"0":1,"1":2,"2":1},"b":{"0":[0,1]}}}`
	pull4codeB := `export function b1(x) {
  if(x > 0){
    return x * 7;
  }else{
    return x * 4;
  }
}

export function b2(x) {
  return x % 2 === 0;
}

export function b3(str) {
  return String(str).toUpperCase();
}`

	// 解析 JSON 到覆盖率对象
	var cov2 map[string]*FileCoverage
	if err := json.Unmarshal([]byte(pull2covB), &cov2); err != nil {
		panic(err)
	}
	var cov4 map[string]*FileCoverage
	if err := json.Unmarshal([]byte(pull4covB), &cov4); err != nil {
		panic(err)
	}

	// 取唯一文件（示例数据仅包含一个文件）
	var entry2, entry4 *FileCoverage
	for _, v := range cov2 {
		entry2 = v
		break
	}
	for _, v := range cov4 {
		entry4 = v
		break
	}

	if entry2 == nil || entry4 == nil {
		panic("missing entries")
	}

	// 在基线上进行分支级合并
	mergeBranchesByHash(entry4, pull4codeB, entry2, pull2codeB)

	// 输出合并后的语句和分支计数
	fmt.Println("\n=== Merged Results (baseline=entry4) ===")

	fmt.Println("\nBranch counters:")
	for id, counts := range entry4.B {
		countsJSON, _ := json.Marshal(counts)
		fmt.Printf("bid=%s counts=%s\n", id, string(countsJSON))
	}
}