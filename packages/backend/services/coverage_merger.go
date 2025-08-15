package services

import (
	"backend/models"
	"fmt"
	"sort"
)

// mergeCoverageMapAndHitResults 合并coverage_map和coverage_hit结果
func (s *CoverageService) mergeCoverageMapAndHitResults(
	coverageMapResult []models.CoverageMapQueryResult,
	coverageHitResult []models.CoverageHitQueryResult,
	coverageMapRelations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	},
) map[string]interface{} {
	result := make(map[string]interface{})

	// 为每个coverage_map结果添加fullFilePath并合并hit数据
	for _, mapItem := range coverageMapResult {
		// 找到对应的fullFilePath
		var fullFilePath string
		for _, relation := range coverageMapRelations {
			if relation.CoverageMapHashID == mapItem.CoverageMapHashID {
				fullFilePath = relation.FullFilePath
				break
			}
		}

		if fullFilePath == "" {
			continue
		}

		// 找到对应的hit数据
		var hitItem *models.CoverageHitQueryResult
		for _, hit := range coverageHitResult {
			if hit.FullFilePath == fullFilePath {
				hitItem = &hit
				break
			}
		}

		// 转换为Istanbul格式
		istanbulStatementMap := s.convertToIstanbulStatementMap(mapItem.StatementMap)
		istanbulFnMap := s.convertToIstanbulFnMap(mapItem.FnMap)
		istanbulBranchMap := s.convertToIstanbulBranchMap(mapItem.BranchMap)

		// 构建Istanbul格式的文件覆盖率数据
		fileCoverageItem := map[string]interface{}{
			"path":         fullFilePath,
			"statementMap": istanbulStatementMap,
			"fnMap":        istanbulFnMap,
			"branchMap":    istanbulBranchMap,
			"s":            s.initializeStatementHits(istanbulStatementMap.Values),
			"f":            s.initializeFunctionHits(istanbulFnMap.Values),
			"b":            s.initializeBranchHits(istanbulBranchMap.Values),
		}

		// 如果有hit数据，则更新计数
		if hitItem != nil {
			fileCoverageItem["s"] = s.buildOrderedHitMap(mapItem.StatementMap, hitItem.S)
			fileCoverageItem["f"] = s.buildOrderedHitMap(mapItem.FnMap, hitItem.F)
			fileCoverageItem["b"] = s.buildOrderedBranchHitMap(mapItem.BranchMap, hitItem.B)
		}

		result[fullFilePath] = fileCoverageItem
	}

	return result
}

// buildOrderedHitMap 构建有序的hit map，按索引排序并填充缺失数据
func (s *CoverageService) buildOrderedHitMap(mapData interface{}, hitData map[uint32]uint32) OrderedMap {
	// 获取所有的索引
	var indices []uint32
	switch m := mapData.(type) {
	case map[uint32]models.StatementInfo:
		for key := range m {
			indices = append(indices, key)
		}
	case map[uint32]models.FunctionInfo:
		for key := range m {
			indices = append(indices, key)
		}
	default:
		return OrderedMap{Keys: []string{}, Values: make(map[string]uint32)}
	}

	// 排序索引
	sort.Slice(indices, func(i, j int) bool {
		return indices[i] < indices[j]
	})

	// 构建有序map
	orderedMap := OrderedMap{
		Keys:   make([]string, len(indices)),
		Values: make(map[string]uint32),
	}

	for i, index := range indices {
		keyStr := fmt.Sprintf("%d", index)
		orderedMap.Keys[i] = keyStr

		if hitCount, exists := hitData[index]; exists {
			orderedMap.Values[keyStr] = hitCount
		} else {
			orderedMap.Values[keyStr] = 0
		}
	}

	return orderedMap
}

// decodeKey 解码分支键，将编码的键解码为 branchId 和 branchLength
func (s *CoverageService) decodeKey(encodedKey uint32) (uint32, uint32) {
	const maxBranchLength = 10000 // 每个分支的最大长度
	branchId := encodedKey / maxBranchLength
	branchLength := encodedKey % maxBranchLength
	return branchId, branchLength
}

// buildOrderedBranchHitMap 构建有序的分支hit map
func (s *CoverageService) buildOrderedBranchHitMap(branchMap map[uint32]models.BranchInfo, hitData map[uint32]uint32) OrderedInterfaceMap {
	// 首先处理hitData，将编码的键解码为分支结构
	decodedHitData := make(map[uint32][]uint32)

	// 解码hitData中的键
	for encodedKey, hitCount := range hitData {
		branchId, branchLength := s.decodeKey(encodedKey)

		if decodedHitData[branchId] == nil {
			decodedHitData[branchId] = make([]uint32, 0)
		}

		// 确保数组足够大
		for len(decodedHitData[branchId]) <= int(branchLength) {
			decodedHitData[branchId] = append(decodedHitData[branchId], 0)
		}

		decodedHitData[branchId][branchLength] = hitCount
	}

	// 获取所有的分支索引并排序
	var indices []uint32
	for key := range branchMap {
		indices = append(indices, key)
	}

	// 排序索引
	sort.Slice(indices, func(i, j int) bool {
		return indices[i] < indices[j]
	})

	// 构建有序map
	result := OrderedInterfaceMap{
		Keys:   make([]string, len(indices)),
		Values: make(map[string]interface{}),
	}

	// 按排序后的索引构建结果
	for i, index := range indices {
		keyStr := fmt.Sprintf("%d", index)
		result.Keys[i] = keyStr
		branch := branchMap[index]

		// 为每个分支路径创建计数数组
		pathCount := len(branch.Paths)
		if pathCount == 0 {
			pathCount = 2 // 默认至少有2个分支路径
		}

		counts := make([]uint32, pathCount)

		// 从解码后的hitData中获取计数
		if branchHits, exists := decodedHitData[index]; exists {
			// 复制计数数据，确保不超出数组边界
			for j := 0; j < len(counts) && j < len(branchHits); j++ {
				counts[j] = branchHits[j]
			}
		}

		result.Values[keyStr] = counts
	}

	return result
}

// initializeStatementHits 初始化语句覆盖率计数为0
func (s *CoverageService) initializeStatementHits(statementMap map[string]interface{}) map[string]uint32 {
	result := make(map[string]uint32)
	for key := range statementMap {
		result[key] = 0
	}
	return result
}

// initializeFunctionHits 初始化函数覆盖率计数为0
func (s *CoverageService) initializeFunctionHits(fnMap map[string]interface{}) map[string]uint32 {
	result := make(map[string]uint32)
	for key := range fnMap {
		result[key] = 0
	}
	return result
}

// initializeBranchHits 初始化分支覆盖率计数为0
func (s *CoverageService) initializeBranchHits(branchMap map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for keyStr, branchInfo := range branchMap {
		if branch, ok := branchInfo.(map[string]interface{}); ok {
			if locations, ok := branch["locations"].([]map[string]interface{}); ok {
				counts := make([]uint32, len(locations))
				result[keyStr] = counts
			}
		}
	}
	return result
}