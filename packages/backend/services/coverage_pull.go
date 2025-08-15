package services

import (
	"backend/dto"
	"fmt"
	"strconv"
)

// resolvePullHeadSHA 解析 PR 的 head SHA（当前支持 GitLab）
func (s *CoverageService) resolvePullHeadSHA(provider, repoID, pullNumber string) (string, error) {
	switch provider {
	case "gitlab":
		pid, err := strconv.Atoi(repoID)
		if err != nil {
			return "", fmt.Errorf("repoID 必须是数字: %w", err)
		}
		prID, err := strconv.Atoi(pullNumber)
		if err != nil {
			return "", fmt.Errorf("pullNumber 必须是数字: %w", err)
		}

		gl := NewGitLabService()
		pr, err := gl.GetPullRequest(pid, prID)
		if err != nil {
			return "", err
		}
		if pr == nil {
			return "", fmt.Errorf("未获取到 Pull Request 详情")
		}
		// 优先使用 diff_refs.head_sha
		if pr.DiffRefs.HeadSha != "" {
			return pr.DiffRefs.HeadSha, nil
		}
		// 其次使用 commits 列表的第一个（通常为最新）
		if len(pr.Commits) > 0 {
			return pr.Commits[0].ID, nil
		}
		return "", fmt.Errorf("无法解析 Pull Request 的 head sha")
	default:
		return "", fmt.Errorf("provider %s 暂不支持 PR 覆盖率聚合", provider)
	}
}

// GetCoverageSummaryForPull 获取PR覆盖率概览
func (s *CoverageService) GetCoverageSummaryForPull(query dto.CoveragePullQueryDto) (interface{}, error) {
	sha, err := s.resolvePullHeadSHA(query.Provider, query.RepoID, query.PullNumber)
	if err != nil {
		return nil, err
	}
	// 先返回 head commit 的概览，后续可改为多 commit 聚合
	return s.GetCoverageSummaryByRepoAndSHA(query.RepoID, sha)
}

// GetCoverageSummaryMapForPull 获取PR覆盖率摘要映射
func (s *CoverageService) GetCoverageSummaryMapForPull(query dto.CoveragePullMapQueryDto) (interface{}, error) {
	sha, err := s.resolvePullHeadSHA(query.Provider, query.RepoID, query.PullNumber)
	if err != nil {
		return nil, err
	}
	// 复用按文件聚合的快速摘要
	dtoq := dto.CoverageQueryDto{
		Provider:       query.Provider,
		RepoID:         query.RepoID,
		SHA:            sha,
		BuildProvider:  query.BuildProvider,
		BuildID:        query.BuildID,
		ReportProvider: query.ReportProvider,
		ReportID:       query.ReportID,
		FilePath:       query.FilePath,
	}
	return s.GetCoverageSummaryMapFast(dtoq)
}

// GetCoverageMapForPull 获取PR覆盖率映射
func (s *CoverageService) GetCoverageMapForPull(query dto.CoveragePullMapQueryDto) (interface{}, error) {
	sha, err := s.resolvePullHeadSHA(query.Provider, query.RepoID, query.PullNumber)
	if err != nil {
		return nil, err
	}
	// 复用 commit 级的详细映射逻辑
	dtoq := dto.CoverageQueryDto{
		Provider:       query.Provider,
		RepoID:         query.RepoID,
		SHA:            sha,
		BuildProvider:  query.BuildProvider,
		BuildID:        query.BuildID,
		ReportProvider: query.ReportProvider,
		ReportID:       query.ReportID,
		FilePath:       query.FilePath,
	}
	return s.GetCoverageMap(dtoq)
}

// GetCoverageMapForMultipleCommits 获取多个commits的覆盖率映射
func (s *CoverageService) GetCoverageMapForMultipleCommits(query dto.CoverageCommitsQueryDto) (interface{}, error) {
	// TODO: 实现多个commits覆盖率映射逻辑
	return map[string]interface{}{
		"message": "GetCoverageMapForMultipleCommits not implemented yet",
		"query":   query,
	}, fmt.Errorf("GetCoverageMapForMultipleCommits not implemented yet")
}

// GetCoverageSummaryMapForMultipleCommits 获取多个commits的覆盖率摘要映射
func (s *CoverageService) GetCoverageSummaryMapForMultipleCommits(query dto.CoverageCommitsQueryDto) (interface{}, error) {
	// TODO: 实现多个commits覆盖率摘要映射逻辑
	return map[string]interface{}{
		"message": "GetCoverageSummaryMapForMultipleCommits not implemented yet",
		"query":   query,
	}, fmt.Errorf("GetCoverageSummaryMapForMultipleCommits not implemented yet")
}
