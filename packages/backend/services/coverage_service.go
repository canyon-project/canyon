package services

import (
	"backend/dto"
)

// CoverageService 覆盖率服务
type CoverageService struct{}

// NewCoverageService 创建覆盖率服务实例
func NewCoverageService() *CoverageService {
	return &CoverageService{}
}

// GetCoverageMap 获取覆盖率映射 - 实现完整的coverage final逻辑
func (s *CoverageService) GetCoverageMap(query dto.CoverageQueryDto) (interface{}, error) {
	return s.getCoverageMapInternal(query)
}

// GetCoverageSummaryMapFast 直接在数据库按文件计算覆盖率摘要（深度优化版）
func (s *CoverageService) GetCoverageSummaryMapFast(query dto.CoverageQueryDto) (map[string]interface{}, error) {
	return s.getCoverageSummaryMapFastInternal(query)
}

// GetCoverageOverviewByRepoAndSHA 根据仓库和SHA获取覆盖率摘要
func (s *CoverageService) GetCoverageOverviewByRepoAndSHA(repoID, sha string) (interface{}, error) {
	return s.getCoverageOverviewByRepoAndSHAInternal(repoID, sha)
}
