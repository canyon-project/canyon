package services

import (
	"backend/models"
	"crypto/sha1"
	"encoding/hex"
	"sort"
	"strings"
)

// canonicalizeSnippet removes all whitespace to make hashing robust to formatting
func canonicalizeSnippet(s string) string {
	return strings.Join(strings.Fields(s), "")
}

func sha1Hex(s string) string {
	sha := sha1.Sum([]byte(s))
	return hex.EncodeToString(sha[:])
}

func computeLineStarts(content string) []int {
	starts := []int{0}
	for i, ch := range content {
		if ch == '\n' {
			starts = append(starts, i+1)
		}
	}
	return starts
}

func posToOffset(line, col int, lineStarts []int) int {
	idx := line - 1
	if idx < 0 {
		idx = 0
	}
	if idx >= len(lineStarts) {
		idx = len(lineStarts) - 1
		if idx < 0 {
			idx = 0
		}
	}
	return lineStarts[idx] + col
}

// 语句片段提取与分组
type stmtNode struct {
	id  uint32
	pos int
}

func sliceByStmtLoc(content string, info models.StatementInfo, lineStarts []int) (string, int) {
	startLine := int(info.StartLine)
	startCol := int(info.StartColumn)
	endLine := int(info.EndLine)
	endCol := int(info.EndColumn)
	start := posToOffset(startLine, startCol, lineStarts)
	end := posToOffset(endLine, endCol, lineStarts)
	if start < 0 {
		start = 0
	}
	if end < start {
		end = start
	}
	if end > len(content) {
		end = len(content)
	}
	return content[start:end], start
}

func buildStmtHashGroups(content string, stmtMap map[uint32]models.StatementInfo) map[string][]stmtNode {
	groups := make(map[string][]stmtNode)
	if stmtMap == nil {
		return groups
	}
	starts := computeLineStarts(content)
	for id, st := range stmtMap {
		code, pos := sliceByStmtLoc(content, st, starts)
		h := sha1Hex(canonicalizeSnippet(code))
		groups[h] = append(groups[h], stmtNode{id: id, pos: pos})
	}
	for h := range groups {
		slice := groups[h]
		sort.Slice(slice, func(i, j int) bool { return slice[i].pos < slice[j].pos })
		groups[h] = slice
	}
	return groups
}

// mergeStatementHitsByBlock 返回应累加到 baseline 的语句命中增量（key 为 baseline 的语句 id）
func (s *CoverageService) mergeStatementHitsByBlock(
	baseContent string,
	baseStmtMap map[uint32]models.StatementInfo,
	otherContent string,
	otherStmtMap map[uint32]models.StatementInfo,
	otherHits map[uint32]uint32,
) map[uint32]uint32 {
	result := make(map[uint32]uint32)
	if len(baseStmtMap) == 0 || len(otherStmtMap) == 0 || len(otherHits) == 0 {
		return result
	}
	baseGroups := buildStmtHashGroups(baseContent, baseStmtMap)
	otherGroups := buildStmtHashGroups(otherContent, otherStmtMap)
	for h, baseNodes := range baseGroups {
		otherNodes, ok := otherGroups[h]
		if !ok || len(otherNodes) == 0 {
			continue
		}
		used := make([]bool, len(otherNodes))
		for _, bn := range baseNodes {
			best := -1
			bestDist := 1<<31 - 1
			for i, on := range otherNodes {
				if used[i] {
					continue
				}
				d := bn.pos - on.pos
				if d < 0 {
					d = -d
				}
				if d < bestDist {
					bestDist = d
					best = i
				}
			}
			if best >= 0 {
				used[best] = true
				inc := otherHits[otherNodes[best].id]
				if inc > 0 {
					result[bn.id] += inc
				}
			}
		}
	}
	return result
}

func sliceByFnLoc(content string, info models.FunctionInfo, lineStarts []int) (string, int) {
	// 使用 EndPos 作为函数 loc（与 convertToIstanbulFnMap 中的 loc 对齐）
	startLine := int(info.EndPos[0])
	startCol := int(info.EndPos[1])
	endLine := int(info.EndPos[2])
	endCol := int(info.EndPos[3])
	start := posToOffset(startLine, startCol, lineStarts)
	end := posToOffset(endLine, endCol, lineStarts)
	if start < 0 {
		start = 0
	}
	if end < start {
		end = start
	}
	if end > len(content) {
		end = len(content)
	}
	return content[start:end], start
}

type fnNode struct {
	id  uint32
	pos int
}

func buildFnHashGroups(content string, fnMap map[uint32]models.FunctionInfo) map[string][]fnNode {
	groups := make(map[string][]fnNode)
	if fnMap == nil {
		return groups
	}
	starts := computeLineStarts(content)
	for id, fn := range fnMap {
		code, pos := sliceByFnLoc(content, fn, starts)
		h := sha1Hex(canonicalizeSnippet(code))
		groups[h] = append(groups[h], fnNode{id: id, pos: pos})
	}
	for h := range groups {
		slice := groups[h]
		sort.Slice(slice, func(i, j int) bool { return slice[i].pos < slice[j].pos })
		groups[h] = slice
	}
	return groups
}

// mergeFunctionHitsByBlock 返回应累加到 baseline 的函数命中增量（key 为 baseline 的函数 id）
func (s *CoverageService) mergeFunctionHitsByBlock(
	baseContent string,
	baseFnMap map[uint32]models.FunctionInfo,
	otherContent string,
	otherFnMap map[uint32]models.FunctionInfo,
	otherHits map[uint32]uint32,
) map[uint32]uint32 {
	result := make(map[uint32]uint32)
	if len(baseFnMap) == 0 || len(otherFnMap) == 0 || len(otherHits) == 0 {
		return result
	}
	baseGroups := buildFnHashGroups(baseContent, baseFnMap)
	otherGroups := buildFnHashGroups(otherContent, otherFnMap)
	for h, baseNodes := range baseGroups {
		otherNodes, ok := otherGroups[h]
		if !ok || len(otherNodes) == 0 {
			continue
		}
		used := make([]bool, len(otherNodes))
		for _, bn := range baseNodes {
			best := -1
			bestDist := 1<<31 - 1
			for i, on := range otherNodes {
				if used[i] {
					continue
				}
				d := bn.pos - on.pos
				if d < 0 {
					d = -d
				}
				if d < bestDist {
					bestDist = d
					best = i
				}
			}
			if best >= 0 {
				used[best] = true
				inc := otherHits[otherNodes[best].id]
				if inc > 0 {
					result[bn.id] += inc
				}
			}
		}
	}
	return result
}
