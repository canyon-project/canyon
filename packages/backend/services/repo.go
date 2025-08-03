package services

import (
	"backend/models"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

type RepoService struct {
	db *gorm.DB
}

func NewRepoService(db *gorm.DB) *RepoService {
	return &RepoService{db: db}
}

// GetByRepoID gets repository by ID or path with namespace
func (s *RepoService) GetByRepoID(repoID string) (*models.Repo, error) {
	var repo models.Repo
	var err error

	if strings.Contains(repoID, "/") {
		err = s.db.Where("path_with_namespace = ?", repoID).First(&repo).Error
	} else {
		err = s.db.Where("id = ?", repoID).First(&repo).Error
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &repo, nil
}

// GetRepoList gets repository list with optional keyword filter
func (s *RepoService) GetRepoList(keyword string) ([]models.RepoWithStats, error) {
	var repos []models.Repo
	query := s.db.Model(&models.Repo{})

	if keyword != "" {
		query = query.Where("id ILIKE ? OR path_with_namespace ILIKE ?",
			"%"+keyword+"%", "%"+keyword+"%")
	}

	err := query.Order("created_at DESC").Find(&repos).Error
	if err != nil {
		return nil, err
	}

	// Get coverage statistics
	var coverages []models.CoverageFromSchema
	err = s.db.Model(&models.CoverageFromSchema{}).
		Select("id, updated_at, repo_id").
		Order("updated_at DESC").
		Find(&coverages).Error
	if err != nil {
		return nil, err
	}

	// Build result with statistics
	var result []models.RepoWithStats
	for _, repo := range repos {
		var reportTimes int
		var lastReportTime time.Time

		// Count coverage reports for this repo
		for _, coverage := range coverages {
			if coverage.RepoID == repo.ID {
				reportTimes++
				if lastReportTime.IsZero() || coverage.UpdatedAt.After(lastReportTime) {
					lastReportTime = coverage.UpdatedAt
				}
			}
		}

		if lastReportTime.IsZero() {
			lastReportTime = time.Unix(0, 0) // 1970-01-01
		}

		result = append(result, models.RepoWithStats{
			Repo:           repo,
			ReportTimes:    reportTimes,
			LastReportTime: lastReportTime,
		})
	}

	// Sort by last report time
	for i := 0; i < len(result)-1; i++ {
		for j := i + 1; j < len(result); j++ {
			if result[j].LastReportTime.After(result[i].LastReportTime) {
				result[i], result[j] = result[j], result[i]
			}
		}
	}

	return result, nil
}

// GetRepoCommitsByRepoID gets commits for a repository
func (s *RepoService) GetRepoCommitsByRepoID(repoID string) ([]models.CommitWithCoverage, error) {
	// First get the repository
	repo, err := s.GetByRepoID(repoID)
	if err != nil {
		return nil, err
	}
	if repo == nil {
		return nil, fmt.Errorf("repository not found")
	}

	// Get coverage list for this repo
	var coverageList []models.CoverageFromSchema
	err = s.db.Where("repo_id = ?", repo.ID).
		Order("created_at DESC").
		Find(&coverageList).Error
	if err != nil {
		return nil, err
	}

	// Extract unique SHAs
	shaSet := make(map[string]bool)
	for _, coverage := range coverageList {
		shaSet[coverage.SHA] = true
	}

	var uniqueShas []string
	for sha := range shaSet {
		uniqueShas = append(uniqueShas, sha)
	}

	// Mock commit details (in real implementation, this would call Git API)
	commitDetails := make(map[string]*models.CommitDetail)
	for _, sha := range uniqueShas {
		commitDetails[sha] = &models.CommitDetail{
			ID:           sha,
			Message:      fmt.Sprintf("Commit %s", sha[:7]),
			AuthorName:   "Developer",
			AuthoredDate: time.Now().Add(-time.Duration(len(sha)) * time.Hour),
		}
	}

	// Group coverage by SHA
	coverageByShA := make(map[string][]models.CoverageForRepo)
	for _, coverage := range coverageList {
		coverageForRepo := models.CoverageForRepo{
			ID:             coverage.ID,
			InstrumentCwd:  coverage.InstrumentCwd,
			SHA:            coverage.SHA,
			Branch:         coverage.Branch,
			CompareTarget:  coverage.CompareTarget,
			Provider:       coverage.Provider,
			BuildProvider:  coverage.BuildProvider,
			BuildID:        coverage.BuildID,
			RepoID:         coverage.RepoID,
			Reporter:       coverage.Reporter,
			ReportProvider: coverage.ReportProvider,
			ReportID:       coverage.ReportID,
			ScopeID:        coverage.ScopeID,
			CreatedAt:      coverage.CreatedAt,
			UpdatedAt:      coverage.UpdatedAt,
		}
		coverageByShA[coverage.SHA] = append(coverageByShA[coverage.SHA], coverageForRepo)
	}

	// Build result
	var result []models.CommitWithCoverage
	for sha, coverageDetail := range coverageByShA {
		result = append(result, models.CommitWithCoverage{
			SHA:            sha,
			CommitDetail:   commitDetails[sha],
			CoverageDetail: coverageDetail,
		})
	}

	return result, nil
}

// GetRepoCommitByCommitSHA gets specific commit details by SHA
func (s *RepoService) GetRepoCommitByCommitSHA(repoID, sha string) (interface{}, error) {
	// Get repository
	repo, err := s.GetByRepoID(repoID)
	if err != nil {
		return nil, err
	}
	if repo == nil {
		return nil, fmt.Errorf("repository not found")
	}

	// Get coverage list for this repo and SHA
	var coverageList []models.CoverageFromSchema
	err = s.db.Where("repo_id = ? AND sha = ?", repo.ID, sha).
		Find(&coverageList).Error
	if err != nil {
		return nil, err
	}

	// Group by build provider and build ID
	type BuildGroup struct {
		BuildProvider string `json:"buildProvider"`
		BuildID       string `json:"buildID"`
	}

	buildGroups := make(map[string]BuildGroup)
	for _, coverage := range coverageList {
		key := fmt.Sprintf("%s-%s", coverage.BuildProvider, coverage.BuildID)
		buildGroups[key] = BuildGroup{
			BuildProvider: coverage.BuildProvider,
			BuildID:       coverage.BuildID,
		}
	}

	// Build result structure similar to the original
	var result []map[string]interface{}
	for _, group := range buildGroups {
		// Filter coverage for this build group
		var groupCoverage []models.CoverageFromSchema
		for _, coverage := range coverageList {
			if coverage.BuildProvider == group.BuildProvider && coverage.BuildID == group.BuildID {
				groupCoverage = append(groupCoverage, coverage)
			}
		}

		// Mock summary calculation (in real implementation, this would calculate from ClickHouse)
		summary := map[string]interface{}{
			"total":   1000,
			"covered": 800,
			"percent": "80.00%",
		}

		// Separate auto and manual modes
		var autoCases []map[string]interface{}
		var manualCases []map[string]interface{}

		for _, coverage := range groupCoverage {
			caseData := map[string]interface{}{
				"id":             coverage.ID,
				"reportID":       coverage.ReportID,
				"reportProvider": coverage.ReportProvider,
				"summary":        summary,
				"caseName":       coverage.ReportID,
				"passedCount":    0,
				"failedCount":    0,
				"totalCount":     0,
				"passRate":       "100%",
			}

			if coverage.ReportProvider == "mpaas" || coverage.ReportProvider == "flytest" {
				autoCases = append(autoCases, caseData)
			} else if coverage.ReportProvider == "person" {
				manualCases = append(manualCases, caseData)
			}
		}

		groupResult := map[string]interface{}{
			"buildID":       group.BuildID,
			"buildProvider": group.BuildProvider,
			"summary":       summary,
			"modeList": []map[string]interface{}{
				{
					"mode":     "auto",
					"summary":  summary,
					"caseList": autoCases,
				},
				{
					"mode":     "manual",
					"summary":  summary,
					"caseList": manualCases,
				},
			},
		}

		result = append(result, groupResult)
	}

	return result, nil
}
