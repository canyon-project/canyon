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
	Path         string                        `json:"path"`
	StatementMap map[string]StatementMapEntry `json:"statementMap"`
	FnMap        map[string]FnMapEntry         `json:"fnMap"`
	BranchMap    map[string]BranchMapEntry     `json:"branchMap"`
	S            map[string]int                `json:"s"`
	F            map[string]int                `json:"f"`
	B            map[string][]int              `json:"b"`
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

// sliceByStatementMapEntry 从文件内容中根据 StatementMapEntry 提取源码片段
func sliceByStatementMapEntry(content string, stmt StatementMapEntry, lineStarts []int) string {
	loc := Loc{Start: stmt.Start, End: stmt.End}
	return sliceByLoc(content, loc, lineStarts)
}

// buildStatementHashToIds 为语句构建"哈希 -> 语句 id 列表"的索引
func buildStatementHashToIds(entry *FileCoverage, content string) map[string][]string {
	index := make(map[string][]string)
	if entry == nil || entry.StatementMap == nil {
		return index
	}

	starts := computeLineStarts(content)
	fmt.Printf("[build-stmt-index] file=%s statements=%d\n", entry.Path, len(entry.StatementMap))

	for id, stmt := range entry.StatementMap {
		code := sliceByStatementMapEntry(content, stmt, starts)
		canon := canonicalizeSnippet(code)
		hash := sha1Hex(canon)

		index[hash] = append(index[hash], id)

		fmt.Printf("[build-stmt-index] sid=%s loc=[(%d,%d)-(%d,%d)] hash=%s code=\"%s\"\n",
			id, stmt.Start.Line, stmt.Start.Column, stmt.End.Line, stmt.End.Column, hash, code)
	}

	return index
}

// mergeStatementsByHash 基于"相同语句代码哈希"进行合并
func mergeStatementsByHash(base *FileCoverage, baseContent string, other *FileCoverage, otherContent string) {
	if base == nil || other == nil {
		return
	}
	baseIdx := buildStatementHashToIds(base, baseContent)
	otherIdx := buildStatementHashToIds(other, otherContent)

	for hash, baseIds := range baseIdx {
		otherIds, ok := otherIdx[hash]
		if !ok || len(otherIds) == 0 {
			fmt.Printf("[merge-stmt] hash=%s no-match\n", hash)
			continue
		}

		fmt.Printf("[merge-stmt] hash=%s baseIds=%v otherIds=%v\n", hash, baseIds, otherIds)

		// 找到other中相同哈希语句的最大执行次数
		maxOther := 0
		for _, oid := range otherIds {
			if v, ok := other.S[oid]; ok && v > maxOther {
				maxOther = v
			}
		}

		fmt.Printf("[merge-stmt] hash=%s maxOther=%d\n", hash, maxOther)

		// 将最大执行次数累加到base中所有匹配的语句
		for _, bid := range baseIds {
			if _, ok := base.S[bid]; ok {
				before := base.S[bid]
				base.S[bid] = before + maxOther
				fmt.Printf("[merge-stmt] sid=%s before=%d +%d => %d\n", bid, before, maxOther, base.S[bid])
			}
		}
	}
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	pull2covB := `{"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js": {"path":"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":2,"column":15}},"1":{"start":{"line":6,"column":2},"end":{"line":6,"column":21}},"2":{"start":{"line":10,"column":2},"end":{"line":10,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":3,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":5,"column":16},"end":{"line":5,"column":18}},"loc":{"start":{"line":5,"column":22},"end":{"line":7,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":24},"end":{"line":11,"column":1}}}},"branchMap":{},"s":{"0":1,"1":2,"2":1},"f":{"0":1,"1":2,"2":1},"b":{}}}`
	pull2codeB := `export function b1(x) {
  return x * 3;
}

export function b2(x) {
  return x % 2 === 0;
}

export function b3(str) {
  return String(str).toLowerCase();
}`

	pull4covB := `{"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js": {"path":"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":2,"column":15}},"1":{"start":{"line":6,"column":2},"end":{"line":6,"column":21}},"2":{"start":{"line":10,"column":2},"end":{"line":10,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":3,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":5,"column":16},"end":{"line":5,"column":18}},"loc":{"start":{"line":5,"column":22},"end":{"line":7,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":24},"end":{"line":11,"column":1}}}},"branchMap":{},"s":{"0":1,"1":2,"2":1},"f":{"0":1,"1":2,"2":1},"b":{}}}`
	pull4codeB := `export function b1(x) {
  return x * 3;
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

	// 在基线（假设 entry4 为基线）上进行语句级合并
	mergeStatementsByHash(entry4, pull4codeB, entry2, pull2codeB)

	// 输出合并后的语句计数
	fmt.Println("\n=== Merged Results (baseline=entry4) ===")
	fmt.Println("Statement counters:")
	for id, count := range entry4.S {
		fmt.Printf("sid=%s count=%d\n", id, count)
	}
}