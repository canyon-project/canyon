package services

import (
	"backend/db"
	"backend/dto"
	"backend/models"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
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
	// 未开启 blockMerge：直接返回 head commit 覆盖明细
	if !query.BlockMerge {
		sha, err := s.resolvePullHeadSHA(query.Provider, query.RepoID, query.PullNumber)
		if err != nil {
			return nil, err
		}
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

	// 开启 blockMerge：以 head 作为 baseline，吸收旧 commit 的相同块命中
	headSHA, err := s.resolvePullHeadSHA(query.Provider, query.RepoID, query.PullNumber)
	if err != nil {
		return nil, err
	}
	pid, err := strconv.Atoi(query.RepoID)
	if err != nil {
		return nil, fmt.Errorf("repoID 必须是数字: %w", err)
	}
	prID, err := strconv.Atoi(query.PullNumber)
	if err != nil {
		return nil, fmt.Errorf("pullNumber 必须是数字: %w", err)
	}
	gl := NewGitLabService()
	commits, err := gl.GetPullRequestCommits(pid, prID)
	if err != nil {
		return nil, err
	}
	if len(commits) == 0 {
		return map[string]interface{}{}, nil
	}

	// 2) 查询这些 commits 的 coverage
	pgDB := db.GetDB()
	var allCoverageList []models.Coverage
	var shas []string
	for _, c := range commits {
		shas = append(shas, c.ID)
	}
	coverageQuery := pgDB.Where("provider = ? AND repo_id = ? AND sha IN ?", query.Provider, query.RepoID, shas)
	if query.BuildProvider != "" {
		coverageQuery = coverageQuery.Where("build_provider = ?", query.BuildProvider)
	}
	if query.BuildID != "" {
		coverageQuery = coverageQuery.Where("build_id = ?", query.BuildID)
	}
	if err := coverageQuery.Find(&allCoverageList).Error; err != nil {
		return nil, fmt.Errorf("查询coverage列表失败: %w", err)
	}
	if len(allCoverageList) == 0 {
		return map[string]interface{}{}, nil
	}

	// 3) relations（去重）与 完整映射 (coverageID|path)->hash
	var relations []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}
	if err := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", s.extractCoverageIDs(allCoverageList)).
		Group("coverage_map_hash_id, full_file_path").
		Find(&relations).Error; err != nil {
		return nil, fmt.Errorf("查询coverageMapRelation失败: %w", err)
	}
	var relationsAll []struct {
		CoverageID        string `gorm:"column:coverage_id"`
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}
	if err := pgDB.Table("canyonjs_coverage_map_relation").
		Select("coverage_id, coverage_map_hash_id, full_file_path").
		Where("coverage_id IN ?", s.extractCoverageIDs(allCoverageList)).
		Find(&relationsAll).Error; err != nil {
		return nil, fmt.Errorf("查询coverageMapRelation(all)失败: %w", err)
	}

	// 4) ClickHouse：coverage_map 和 每个 coverage 的 hits（带 coverage_id）
	coverageMapResult, _, err := s.queryClickHouseData(relations, allCoverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		return nil, err
	}
	perCoverageHits, err := s.queryCoverageHitsWithCoverageID(allCoverageList, query.ReportProvider, query.ReportID)
	if err != nil {
		return nil, err
	}

	// 5) baseline 与差异文件
	coveredSHA := map[string]bool{}
	for _, c := range allCoverageList {
		coveredSHA[c.SHA] = true
	}
	// baseline 覆盖记录集合
	baseCoverageIDs := map[string]bool{}
	var baselineInstrumentCwd string
	for _, cov := range allCoverageList {
		if cov.SHA == headSHA {
			baseCoverageIDs[cov.ID] = true
			baselineInstrumentCwd = cov.InstrumentCwd
		}
	}
	// 如果 head 没有覆盖，退化为任一覆盖作为 baseline
	if len(baseCoverageIDs) == 0 {
		baseCoverageIDs[allCoverageList[0].ID] = true
		baselineInstrumentCwd = allCoverageList[0].InstrumentCwd
		headSHA = allCoverageList[0].SHA
	}

	// 旧 -> 变更文件集合
	changedBySHA := map[string]map[string]bool{}
	for _, c := range commits {
		if c.ID == headSHA || !coveredSHA[c.ID] {
			continue
		}
		diffs, err := gl.GetCommitDiff(pid, c.ID, headSHA)
		if err != nil {
			continue
		}
		set := map[string]bool{}
		for _, d := range diffs {
			if d.OldPath != "" {
				set[d.OldPath] = true
			}
			if d.NewPath != "" {
				set[d.NewPath] = true
			}
		}
		changedBySHA[c.ID] = set
	}

	// 6) 索引与缓存
	hashToMap := make(map[string]models.CoverageMapQueryResult)
	for _, m := range coverageMapResult {
		hashToMap[m.CoverageMapHashID] = m
	}
	covPathToHash := map[string]string{}
	for _, r := range relationsAll {
		covPathToHash[r.CoverageID+"|"+r.FullFilePath] = r.CoverageMapHashID
	}
	// 选择一个 baseline 覆盖ID
	var baselineCovID string
	for id := range baseCoverageIDs {
		baselineCovID = id
		break
	}

	contentCache := map[string]string{}
	fetch := func(sha, path string) (string, error) {
		key := sha + "|" + path
		if s, ok := contentCache[key]; ok {
			return s, nil
		}
		b64, err := gl.GetFileContentBase64(pid, sha, path)
		if err != nil {
			return "", err
		}
		dec, err := base64.StdEncoding.DecodeString(b64)
		if err != nil {
			return "", err
		}
		s := string(dec)
		contentCache[key] = s
		return s, nil
	}
	normalize := func(abs, cwd string) string { p := strings.TrimPrefix(abs, cwd); return strings.TrimPrefix(p, "/") }

	// 7) 聚合命中
	type aggHits struct{ S, F, B map[uint32]uint32 }
	aggregated := map[string]*aggHits{}
	ensure := func(path string) *aggHits {
		if aggregated[path] == nil {
			aggregated[path] = &aggHits{S: map[uint32]uint32{}, F: map[uint32]uint32{}, B: map[uint32]uint32{}}
		}
		return aggregated[path]
	}

	// 将每个 coverage 的命中并入
	covHitsByID := map[string][]models.CoverageHitSummaryResult{}
	for _, row := range perCoverageHits {
		covHitsByID[row.CoverageID] = append(covHitsByID[row.CoverageID], row)
	}
	// 构建 coverageID -> item
	covByID := map[string]models.Coverage{}
	for _, c := range allCoverageList {
		covByID[c.ID] = c
	}

	for covID, rows := range covHitsByID {
		covItem, ok := covByID[covID]
		if !ok {
			continue
		}
		isBaseline := baseCoverageIDs[covItem.ID]
		for _, row := range rows {
			relPath := normalize(row.FullFilePath, covItem.InstrumentCwd)
			include := isBaseline
			if !isBaseline {
				if set := changedBySHA[covItem.SHA]; set != nil && set[relPath] {
					include = false
				} else {
					include = true
				}
			}
			if include {
				agg := ensure(row.FullFilePath)
				for k, v := range row.S {
					agg.S[k] += v
				}
				for k, v := range row.F {
					agg.F[k] += v
				}
				for k, v := range row.B {
					agg.B[k] += v
				}
				continue
			}
			// 块级合并
			baseKey := baselineCovID + "|" + row.FullFilePath
			otherKey := covItem.ID + "|" + row.FullFilePath
			baseHash, okA := covPathToHash[baseKey]
			otherHash, okB := covPathToHash[otherKey]
			if !okA || !okB {
				continue
			}
			baseMap, ok1 := hashToMap[baseHash]
			otherMap, ok2 := hashToMap[otherHash]
			if !ok1 || !ok2 {
				continue
			}
			baseContent, err1 := fetch(headSHA, normalize(row.FullFilePath, baselineInstrumentCwd))
			otherContent, err2 := fetch(covItem.SHA, relPath)
			if err1 != nil || err2 != nil {
				continue
			}
			contribFn := s.mergeFunctionHitsByBlock(baseContent, baseMap.FnMap, otherContent, otherMap.FnMap, row.F)
			contribSt := s.mergeStatementHitsByBlock(baseContent, baseMap.StatementMap, otherContent, otherMap.StatementMap, row.S)
			agg := ensure(row.FullFilePath)
			for k, v := range contribFn {
				agg.F[k] += v
			}
			for k, v := range contribSt {
				agg.S[k] += v
			}
		}
	}

	// 8) 用 baseline 的结构生成最终返回
	baseResult := s.mergeCoverageMapAndHitResults(coverageMapResult, []models.CoverageHitQueryResult{}, relations)
	for path, agg := range aggregated {
		baseKey := baselineCovID + "|" + path
		hashID, ok := covPathToHash[baseKey]
		if !ok {
			continue
		}
		m, ok := hashToMap[hashID]
		if !ok {
			continue
		}
		if item, ok := baseResult[path].(map[string]interface{}); ok {
			item["s"] = s.buildOrderedHitMap(m.StatementMap, agg.S)
			item["f"] = s.buildOrderedHitMap(m.FnMap, agg.F)
			item["b"] = s.buildOrderedBranchHitMap(m.BranchMap, agg.B)
			baseResult[path] = item
		}
	}

	return s.removeCoverageInstrumentCwd(baseResult, baselineInstrumentCwd), nil
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
