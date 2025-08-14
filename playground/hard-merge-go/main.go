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

// FileCoverage 表示某个文件的覆盖率条目结构（与 Istanbul JSON 对齐的子集）。
// 仅保留本示例所需的字段。
type FileCoverage struct {
	Path  string                `json:"path"`
	FnMap map[string]FnMapEntry `json:"fnMap"`
	S     map[string]int        `json:"s"`
	F     map[string]int        `json:"f"`
	B     map[string][]int      `json:"b"`
}

// canonicalizeSnippet 对代码片段做归一化处理，以降低无关字符对哈希的影响。
// 当前实现去除所有空白字符（空格、制表符、换行），使仅语义级别的变动影响哈希。
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

// buildFnHashToIds 为函数构建“哈希 -> 函数 id 列表”的索引。
// 哈希基于函数的 loc 范围对应的源码片段（空白归一化后）。
func buildFnHashToIds(entry *FileCoverage, content string) map[string][]string {
	index := make(map[string][]string)
	if entry == nil || entry.FnMap == nil {
		return index
	}
	starts := computeLineStarts(content)
	log.Printf("[build-index] file=%s functions=%d", entry.Path, len(entry.FnMap))
	for id, fn := range entry.FnMap {
		code := sliceByLoc(content, fn.Loc, starts)
		canon := canonicalizeSnippet(code)
		hash := sha1Hex(canon)
		index[hash] = append(index[hash], id)
		log.Printf("[build-index] fid=%s name=%s loc=[(%d,%d)-(%d,%d)] hash=%s", id, fn.Name, fn.Loc.Start.Line, fn.Loc.Start.Column, fn.Loc.End.Line, fn.Loc.End.Column, hash)
	}
	return index
}

// mergeFunctionsByHash 基于“相同函数代码哈希”进行合并：
// - 在 base 与 other 间用函数代码哈希对齐
// - 对齐后取 other 中该哈希下所有函数计数的最大值，累加到 base 的每个匹配函数计数上
// 这样避免同一代码片段在同文件重复出现导致的过度放大
func mergeFunctionsByHash(base *FileCoverage, baseContent string, other *FileCoverage, otherContent string) {
	if base == nil || other == nil {
		return
	}
	log.Printf("[merge-fn] begin file(base)=%s file(other)=%s", base.Path, other.Path)
	baseIdx := buildFnHashToIds(base, baseContent)
	otherIdx := buildFnHashToIds(other, otherContent)

	for hash, baseIds := range baseIdx {
		otherIds, ok := otherIdx[hash]
		if !ok || len(otherIds) == 0 {
			log.Printf("[merge-fn] hash=%s no-match", hash)
			continue
		}
		log.Printf("[merge-fn] hash=%s baseIds=%v otherIds=%v", hash, baseIds, otherIds)
		maxOther := 0
		for _, oid := range otherIds {
			if v, ok := other.F[oid]; ok && v > maxOther {
				maxOther = v
			}
		}
		log.Printf("[merge-fn] hash=%s maxOther=%d", hash, maxOther)
		for _, bid := range baseIds {
			if _, ok := base.F[bid]; ok {
				before := base.F[bid]
				base.F[bid] = before + maxOther
				log.Printf("[merge-fn] fid=%s before=%d +%d => %d", bid, before, maxOther, base.F[bid])
			}
		}
	}
	log.Printf("[merge-fn] done file=%s", base.Path)
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
	// 示例：pull #1 中 0002 与 0004 的 b.js
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
  return x * 7;
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

	// 在基线（假设 0004 为基线）上进行函数级合并（将 0002 的匹配函数计数合并进 0004）
	mergeFunctionsByHash(entry4, pull4codeB, entry2, pull2codeB)

	// 输出合并后的函数计数
	fmt.Println("merged function counters (baseline=0004):")
	for id, count := range entry4.F {
		name := entry4.FnMap[id].Name
		fmt.Printf("fid=%s name=%s count=%d\n", id, name, count)
	}
}
