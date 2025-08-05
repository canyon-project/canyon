package utils

import (
	"backend/models"
	"regexp"
	"strconv"
	"strings"
)

// ToUint32 将 interface{} 转换为 uint32
func ToUint32(v interface{}) uint32 {
	switch val := v.(type) {
	case uint32:
		return val
	case uint64:
		return uint32(val)
	case int:
		return uint32(val)
	case int32:
		return uint32(val)
	case int64:
		return uint32(val)
	default:
		return 0
	}
}

// ParseStatementMapSimple 解析语句映射字符串
func ParseStatementMapSimple(mapStr string) map[uint32]models.StatementInfo {
	result := make(map[uint32]models.StatementInfo)
	mapStr = strings.Trim(mapStr, "{}")
	
	// 使用正则匹配 key:(startLine,startColumn,endLine,endColumn) 格式
	re := regexp.MustCompile(`(\d+):\((\d+),(\d+),(\d+),(\d+)\)`)
	matches := re.FindAllStringSubmatch(mapStr, -1)
	
	for _, match := range matches {
		if len(match) == 6 {
			key, _ := strconv.ParseUint(match[1], 10, 32)
			startLine, _ := strconv.ParseUint(match[2], 10, 32)
			startColumn, _ := strconv.ParseUint(match[3], 10, 32)
			endLine, _ := strconv.ParseUint(match[4], 10, 32)
			endColumn, _ := strconv.ParseUint(match[5], 10, 32)
			
			result[uint32(key)] = models.StatementInfo{
				StartLine:   uint32(startLine),
				StartColumn: uint32(startColumn),
				EndLine:     uint32(endLine),
				EndColumn:   uint32(endColumn),
			}
		}
	}
	
	return result
}

// ParseFunctionMapSimple 解析函数映射字符串
func ParseFunctionMapSimple(mapStr string) map[uint32]models.FunctionInfo {
	result := make(map[uint32]models.FunctionInfo)
	mapStr = strings.Trim(mapStr, "{}")
	
	// 匹配 key:('name',line,(pos1,pos2,pos3,pos4),(pos5,pos6,pos7,pos8))
	re := regexp.MustCompile(`(\d+):\('([^']*)',(\d+),\((\d+),(\d+),(\d+),(\d+)\),\((\d+),(\d+),(\d+),(\d+)\)\)`)
	matches := re.FindAllStringSubmatch(mapStr, -1)
	
	for _, match := range matches {
		if len(match) == 12 {
			key, _ := strconv.ParseUint(match[1], 10, 32)
			name := match[2]
			line, _ := strconv.ParseUint(match[3], 10, 32)
			
			// 解析位置信息
			startPos := [4]uint32{}
			endPos := [4]uint32{}
			for i := 0; i < 4; i++ {
				val, _ := strconv.ParseUint(match[4+i], 10, 32)
				startPos[i] = uint32(val)
			}
			for i := 0; i < 4; i++ {
				val, _ := strconv.ParseUint(match[8+i], 10, 32)
				endPos[i] = uint32(val)
			}
			
			result[uint32(key)] = models.FunctionInfo{
				Name:     name,
				Line:     uint32(line),
				StartPos: startPos,
				EndPos:   endPos,
			}
		}
	}
	
	return result
}

// ParseBranchMapSimple 解析分支映射字符串
func ParseBranchMapSimple(mapStr string) map[uint32]models.BranchInfo {
	result := make(map[uint32]models.BranchInfo)
	mapStr = strings.Trim(mapStr, "{}")
	
	// 匹配 key:(type,line,(pos1,pos2,pos3,pos4),[paths])
	re := regexp.MustCompile(`(\d+):\((\d+),(\d+),\((\d+),(\d+),(\d+),(\d+)\),\[([^\]]*)\]\)`)
	matches := re.FindAllStringSubmatch(mapStr, -1)
	
	for _, match := range matches {
		if len(match) == 9 {
			key, _ := strconv.ParseUint(match[1], 10, 32)
			branchType, _ := strconv.ParseUint(match[2], 10, 8)
			line, _ := strconv.ParseUint(match[3], 10, 32)
			
			// 解析位置
			position := [4]uint32{}
			for i := 0; i < 4; i++ {
				val, _ := strconv.ParseUint(match[4+i], 10, 32)
				position[i] = uint32(val)
			}
			
			// 解析路径数组
			pathsStr := match[8]
			paths := ParsePaths(pathsStr)
			
			result[uint32(key)] = models.BranchInfo{
				Type:     uint8(branchType),
				Line:     uint32(line),
				Position: position,
				Paths:    paths,
			}
		}
	}
	
	return result
}

// ParsePaths 解析路径数组
func ParsePaths(pathsStr string) [][4]uint32 {
	var paths [][4]uint32
	
	// 匹配 (num1,num2,num3,num4) 格式
	re := regexp.MustCompile(`\((\d+),(\d+),(\d+),(\d+)\)`)
	matches := re.FindAllStringSubmatch(pathsStr, -1)
	
	for _, match := range matches {
		if len(match) == 5 {
			path := [4]uint32{}
			for i := 0; i < 4; i++ {
				val, _ := strconv.ParseUint(match[1+i], 10, 32)
				path[i] = uint32(val)
			}
			paths = append(paths, path)
		}
	}
	
	return paths
}

// ConvertStatementMap 转换语句映射从interface{}到StatementInfo
// ClickHouse 返回的格式是 [startLine, startColumn, endLine, endColumn]
func ConvertStatementMap(statementMap map[uint32][]interface{}) map[uint32]models.StatementInfo {
	result := make(map[uint32]models.StatementInfo)
	
	for key, stmt := range statementMap {
		if len(stmt) >= 4 {
			startLine := ToUint32(stmt[0])
			startColumn := ToUint32(stmt[1])
			endLine := ToUint32(stmt[2])
			endColumn := ToUint32(stmt[3])
			
			result[key] = models.StatementInfo{
				StartLine:   startLine,
				StartColumn: startColumn,
				EndLine:     endLine,
				EndColumn:   endColumn,
			}
		}
	}
	
	return result
}

// ParseMapString 解析ClickHouse返回的map字符串格式 {key:value,key:value}
func ParseMapString(mapStr string) map[uint32]uint32 {
	result := make(map[uint32]uint32)
	
	if mapStr == "" || mapStr == "{}" {
		return result
	}
	
	// 去掉大括号
	mapStr = strings.Trim(mapStr, "{}")
	
	// 使用正则匹配 key:value 格式
	re := regexp.MustCompile(`(\d+):(\d+)`)
	matches := re.FindAllStringSubmatch(mapStr, -1)
	
	for _, match := range matches {
		if len(match) == 3 {
			key, err1 := strconv.ParseUint(match[1], 10, 32)
			value, err2 := strconv.ParseUint(match[2], 10, 32)
			if err1 == nil && err2 == nil {
				result[uint32(key)] = uint32(value)
			}
		}
	}
	
	return result
}