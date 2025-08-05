package services

import (
	"backend/db"
	"backend/models"
	"fmt"
	"strings"
	"time"
)

// RepoService 仓库服务
type RepoService struct{}

// NewRepoService 创建仓库服务实例
func NewRepoService() *RepoService {
	return &RepoService{}
}

// GetRepoList 获取仓库列表
func (s *RepoService) GetRepoList(keyword string) (interface{}, error) {
	database := db.GetDB()
	var repos []models.Repo
	
	query := database.Model(&models.Repo{})
	
	// 如果有关键词，进行模糊搜索
	if keyword != "" {
		searchPattern := "%" + strings.ToLower(keyword) + "%"
		query = query.Where(
			"LOWER(path_with_namespace) LIKE ? OR LOWER(description) LIKE ?", 
			searchPattern, searchPattern,
		)
	}
	
	// 按创建时间倒序排列，限制返回数量避免数据过多
	if err := query.Order("created_at DESC").Limit(100).Find(&repos).Error; err != nil {
		return nil, fmt.Errorf("查询仓库列表失败: %w", err)
	}
	
	// 为每个仓库计算额外的字段
	for i := range repos {
		// 查询该仓库的覆盖率记录统计
		var coverageStats struct {
			ReportTimes    int       `json:"reportTimes"`
			MaxCoverage    float64   `json:"maxCoverage"`
			LastReportTime time.Time `json:"lastReportTime"`
		}
		
		if err := database.Model(&models.Coverage{}).
			Select("COUNT(*) as report_times, MAX(created_at) as last_report_time").
			Where("repo_id = ?", repos[i].ID).
			Scan(&coverageStats).Error; err != nil {
			// 如果查询失败，设置默认值
			repos[i].ReportTimes = 0
			repos[i].MaxCoverage = 0
			repos[i].LastReportTime = time.Time{}
		} else {
			repos[i].ReportTimes = coverageStats.ReportTimes
			repos[i].LastReportTime = coverageStats.LastReportTime
		}
		
		// 设置默认值
		repos[i].Favored = false // 这里可以根据用户偏好设置
	}
	
	return map[string]interface{}{
		"data":  repos,
		"total": len(repos),
	}, nil
}

// GetByRepoId 根据仓库ID获取仓库信息
func (s *RepoService) GetByRepoId(repoID string) (interface{}, error) {
	database := db.GetDB()
	var repo models.Repo
	
	// 判断repoID是否包含斜杠，如果包含则使用path_with_namespace字段查询
	if strings.Contains(repoID, "/") {
		if err := database.Where("path_with_namespace = ?", repoID).First(&repo).Error; err != nil {
			return nil, fmt.Errorf("查询仓库信息失败: %w", err)
		}
	} else {
		if err := database.Where("id = ?", repoID).First(&repo).Error; err != nil {
			return nil, fmt.Errorf("查询仓库信息失败: %w", err)
		}
	}
	
	return repo, nil
}

// GetCommitsByRepoId 根据仓库ID获取提交记录
func (s *RepoService) GetCommitsByRepoId(repoID string) (interface{}, error) {
	database := db.GetDB()
	
	// 首先验证仓库是否存在
	var repo models.Repo
	if strings.Contains(repoID, "/") {
		if err := database.Where("path_with_namespace = ?", repoID).First(&repo).Error; err != nil {
			return nil, fmt.Errorf("仓库不存在: %w", err)
		}
	} else {
		if err := database.Where("id = ?", repoID).First(&repo).Error; err != nil {
			return nil, fmt.Errorf("仓库不存在: %w", err)
		}
	}
	
	// 查询该仓库的所有覆盖率记录，按SHA分组
	var commits []struct {
		SHA           string `json:"sha"`
		Branch        string `json:"branch"`
		CompareTarget string `json:"compareTarget"`
		Provider      string `json:"provider"`
		CreatedAt     string `json:"createdAt"`
		LatestID      string `json:"latestId"`
	}
	
	if err := database.Model(&models.Coverage{}).
		Select("sha, branch, compare_target, provider, MAX(created_at) as created_at, MAX(id) as latest_id").
		Where("repo_id = ?", repo.ID). // 使用repo.ID而不是repoID
		Group("sha, branch, compare_target, provider").
		Order("MAX(created_at) DESC").
		Scan(&commits).Error; err != nil {
		return nil, fmt.Errorf("查询提交记录失败: %w", err)
	}
	
	return map[string]interface{}{
		"repo":    repo,
		"commits": commits,
		"total":   len(commits),
	}, nil
}

// GetCommitBySHA 根据提交SHA获取提交详情
func (s *RepoService) GetCommitBySHA(repoID, sha string) (interface{}, error) {
	database := db.GetDB()
	
	// 首先验证仓库是否存在
	var repo models.Repo
	if err := database.Where("id = ?", repoID).First(&repo).Error; err != nil {
		return nil, fmt.Errorf("仓库不存在: %w", err)
	}
	
	// 查询该SHA的所有覆盖率记录
	var coverages []models.Coverage
	if err := database.Where("repo_id = ? AND sha = ?", repoID, sha).
		Order("created_at DESC").
		Find(&coverages).Error; err != nil {
		return nil, fmt.Errorf("查询提交详情失败: %w", err)
	}
	
	if len(coverages) == 0 {
		return nil, fmt.Errorf("未找到SHA为 %s 的提交记录", sha)
	}
	
	return map[string]interface{}{
		"repo":      repo,
		"sha":       sha,
		"coverages": coverages,
		"total":     len(coverages),
	}, nil
}