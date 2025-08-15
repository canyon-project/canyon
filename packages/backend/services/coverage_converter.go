package services

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// OrderedMap 有序map结构，用于保持JSON序列化时的顺序
type OrderedMap struct {
	Keys   []string
	Values map[string]uint32
}

// MarshalJSON 自定义JSON序列化，保持key的顺序
func (om OrderedMap) MarshalJSON() ([]byte, error) {
	// 对keys进行数字排序
	sortedKeys := make([]string, len(om.Keys))
	copy(sortedKeys, om.Keys)

	// 使用数字排序而不是字符串排序
	sort.Slice(sortedKeys, func(i, j int) bool {
		keyI, _ := strconv.Atoi(sortedKeys[i])
		keyJ, _ := strconv.Atoi(sortedKeys[j])
		return keyI < keyJ
	})

	result := "{"
	for i, key := range sortedKeys {
		if i > 0 {
			result += ","
		}
		result += fmt.Sprintf("\"%s\":%d", key, om.Values[key])
	}
	result += "}"
	return []byte(result), nil
}

// OrderedInterfaceMap 有序interface map结构，用于保持JSON序列化时的顺序
type OrderedInterfaceMap struct {
	Keys   []string
	Values map[string]interface{}
}

// MarshalJSON 自定义JSON序列化，保持key的顺序
func (om OrderedInterfaceMap) MarshalJSON() ([]byte, error) {
	// 对keys进行数字排序
	sortedKeys := make([]string, len(om.Keys))
	copy(sortedKeys, om.Keys)

	// 使用数字排序而不是字符串排序
	sort.Slice(sortedKeys, func(i, j int) bool {
		keyI, _ := strconv.Atoi(sortedKeys[i])
		keyJ, _ := strconv.Atoi(sortedKeys[j])
		return keyI < keyJ
	})

	result := "{"
	for i, key := range sortedKeys {
		if i > 0 {
			result += ","
		}
		valueBytes, err := json.Marshal(om.Values[key])
		if err != nil {
			return nil, err
		}
		result += fmt.Sprintf("\"%s\":%s", key, string(valueBytes))
	}
	result += "}"
	return []byte(result), nil
}

// convertToIstanbulStatementMap 转换为Istanbul格式的statementMap
func (s *CoverageService) convertToIstanbulStatementMap(statementMap map[uint32]models.StatementInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range statementMap {
		keys = append(keys, key)
	}

	// 排序keys
	sort.Slice(keys, func(i, j int) bool {
		return keys[i] < keys[j]
	})

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		stmt := statementMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		// 转换line和column，0值转为null
		// 现在 StatementInfo 直接存储了起始和结束位置
		startLine := s.convertZeroToNull(stmt.StartLine)
		startColumn := s.convertZeroToNull(stmt.StartColumn)
		endLine := s.convertZeroToNull(stmt.EndLine)
		endColumn := s.convertZeroToNull(stmt.EndColumn)

		result.Values[keyStr] = map[string]interface{}{
			"start": map[string]interface{}{
				"line":   startLine,
				"column": startColumn,
			},
			"end": map[string]interface{}{
				"line":   endLine,
				"column": endColumn,
			},
		}
	}

	return result
}

// convertToIstanbulFnMap 转换为Istanbul格式的fnMap
func (s *CoverageService) convertToIstanbulFnMap(fnMap map[uint32]models.FunctionInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range fnMap {
		keys = append(keys, key)
	}

	// 排序keys
	sort.Slice(keys, func(i, j int) bool {
		return keys[i] < keys[j]
	})

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		fn := fnMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		// 转换line和column，0值转为null
		startLine := s.convertZeroToNull(fn.StartPos[0])
		startColumn := s.convertZeroToNull(fn.StartPos[1])
		endLine := s.convertZeroToNull(fn.EndPos[0])
		endColumn := s.convertZeroToNull(fn.EndPos[1])

		result.Values[keyStr] = map[string]interface{}{
			"name": fn.Name,
			"decl": map[string]interface{}{
				"start": map[string]interface{}{
					"line":   startLine,
					"column": startColumn,
				},
				"end": map[string]interface{}{
					"line":   endLine,
					"column": endColumn,
				},
			},
			"loc": map[string]interface{}{
				"start": map[string]interface{}{
					"line":   startLine,
					"column": startColumn,
				},
				"end": map[string]interface{}{
					"line":   endLine,
					"column": endColumn,
				},
			},
			"line": startLine,
		}
	}

	return result
}

// getBranchTypeByIndex 根据索引返回对应的分支类型
func (s *CoverageService) getBranchTypeByIndex(index uint8) string {
	switch index {
	case 1:
		return "if"
	case 2:
		return "binary-expr"
	case 3:
		return "cond-expr"
	case 4:
		return "switch"
	case 5:
		return "default-arg"
	default:
		return "unknown"
	}
}

// convertToIstanbulBranchMap 转换为Istanbul格式的branchMap
func (s *CoverageService) convertToIstanbulBranchMap(branchMap map[uint32]models.BranchInfo) OrderedInterfaceMap {
	// 获取所有key并排序
	var keys []uint32
	for key := range branchMap {
		keys = append(keys, key)
	}

	// 排序keys
	sort.Slice(keys, func(i, j int) bool {
		return keys[i] < keys[j]
	})

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(keys)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的key构建结果
	for i, key := range keys {
		branch := branchMap[key]
		keyStr := fmt.Sprintf("%d", key)
		result.Keys[i] = keyStr

		// 转换locations
		locations := make([]map[string]interface{}, len(branch.Paths))
		for j, path := range branch.Paths {
			locations[j] = map[string]interface{}{
				"start": map[string]interface{}{
					"line":   s.convertZeroToNull(path[0]),
					"column": s.convertZeroToNull(path[1]),
				},
				"end": map[string]interface{}{
					"line":   s.convertZeroToNull(path[2]),
					"column": s.convertZeroToNull(path[3]),
				},
			}
		}

		result.Values[keyStr] = map[string]interface{}{
			"line":      s.convertZeroToNull(branch.Line),
			"type":      s.getBranchTypeByIndex(branch.Type),
			"locations": locations,
		}
	}

	return result
}

// convertZeroToNull 将0值转换为null，非0值保持原值
func (s *CoverageService) convertZeroToNull(value uint32) interface{} {
	if value == 0 {
		return nil
	}
	return value
}

// convertTupleSliceToUint32Map 将ClickHouse tuple slice转换为uint32 map
func (s *CoverageService) convertTupleSliceToUint32Map(tupleSlice []interface{}) map[uint32]uint32 {
	result := make(map[uint32]uint32)

	if len(tupleSlice) != 2 {
		return result
	}

	// 尝试不同的类型转换
	var keys []uint32
	var values []uint64

	// 处理keys
	switch k := tupleSlice[0].(type) {
	case []uint32:
		keys = k
	case []interface{}:
		keys = make([]uint32, len(k))
		for i, v := range k {
			if val, ok := v.(uint32); ok {
				keys[i] = val
			}
		}
	default:
		return result
	}

	// 处理values
	switch v := tupleSlice[1].(type) {
	case []uint64:
		values = v
	case []uint32:
		values = make([]uint64, len(v))
		for i, val := range v {
			values[i] = uint64(val)
		}
	case []interface{}:
		values = make([]uint64, len(v))
		for i, val := range v {
			switch vVal := val.(type) {
			case uint64:
				values[i] = vVal
			case uint32:
				values[i] = uint64(vVal)
			case int64:
				values[i] = uint64(vVal)
			case int32:
				values[i] = uint64(vVal)
			case int:
				values[i] = uint64(vVal)
			}
		}
	default:
		return result
	}

	// 确保keys和values长度一致
	minLen := len(keys)
	if len(values) < minLen {
		minLen = len(values)
	}

	// 转换为map
	for i := 0; i < minLen; i++ {
		result[keys[i]] = uint32(values[i])
	}

	return result
}

// removeCoverageInstrumentCwd 移除覆盖率路径中的instrumentCwd
func (s *CoverageService) removeCoverageInstrumentCwd(
	result map[string]interface{},
	instrumentCwd string,
) map[string]interface{} {
	if instrumentCwd == "" {
		return result
	}

	newResult := make(map[string]interface{})
	for filePath, coverage := range result {
		// 移除instrumentCwd前缀
		newPath := strings.TrimPrefix(filePath, instrumentCwd)
		newPath = strings.TrimPrefix(newPath, "/")

		// 更新coverage中的path字段
		if coverageMap, ok := coverage.(map[string]interface{}); ok {
			coverageMap["path"] = newPath
			newResult[newPath] = coverageMap
		} else {
			newResult[newPath] = coverage
		}
	}

	return newResult
}

// convertInterfaceSliceToUint32Slice 将interface slice转换为uint32 slice
func (s *CoverageService) convertInterfaceSliceToUint32Slice(input []interface{}) []uint32 {
	var result []uint32
	for _, item := range input {
		switch v := item.(type) {
		case uint32:
			result = append(result, v)
		case int:
			result = append(result, uint32(v))
		case int32:
			result = append(result, uint32(v))
		case int64:
			result = append(result, uint32(v))
		case uint64:
			result = append(result, uint32(v))
		}
	}
	return result
}

// convertBranchHits 转换分支覆盖率计数
func (s *CoverageService) convertBranchHits(branchHits map[uint32]uint32, branchMap map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	for keyStr, branchInfo := range branchMap {
		if branch, ok := branchInfo.(map[string]interface{}); ok {
			if locations, ok := branch["locations"].([]map[string]interface{}); ok {
				// 创建与locations数量相同的计数数组
				counts := make([]uint32, len(locations))
				
				// 从branchHits中获取对应的计数
				if keyUint, err := strconv.ParseUint(keyStr, 10, 32); err == nil {
					if hits, exists := branchHits[uint32(keyUint)]; exists {
						// 将hits值设置到第一个位置，其他位置保持0
						if len(counts) > 0 {
							counts[0] = hits
						}
					}
				}
				
				result[keyStr] = counts
			}
		}
	}

	return result
}