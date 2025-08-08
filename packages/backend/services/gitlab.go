package services

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"gorm.io/gorm"
)

// GitLabService GitLab服务
type GitLabService struct {
	db *gorm.DB
}

// NewGitLabService 创建GitLab服务
func NewGitLabService() *GitLabService {
	return &GitLabService{
		db: db.GetDB(),
	}
}

// GitLabConfig GitLab配置
type GitLabConfig struct {
	BaseURL string
	Token   string
}

// GetGitLabConfig 获取GitLab配置
func (s *GitLabService) GetGitLabConfig() (*GitLabConfig, error) {
	// 获取GitLab基础URL
	var baseURLConfig models.Config
	err := s.db.Where("key = ?", "system_config.gitlab_base_url").First(&baseURLConfig).Error
	if err != nil {
		return nil, fmt.Errorf("获取GitLab基础URL失败: %v", err)
	}

	// 获取GitLab token - 使用git_provider[0].private_token
	var tokenConfig models.Config
	err = s.db.Where("key = ?", "git_provider[0].private_token").First(&tokenConfig).Error
	if err != nil {
		return nil, fmt.Errorf("获取GitLab token失败: %v", err)
	}

	return &GitLabConfig{
		BaseURL: baseURLConfig.Value,
		Token:   tokenConfig.Value,
	}, nil
}

// GitLabPullRequest GitLab Pull Request结构
type GitLabPullRequest struct {
	ID          int       `json:"id"`
	IID         int       `json:"iid"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	State       string    `json:"state"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Author      struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		Username string `json:"username"`
	} `json:"author"`
	SourceBranch string `json:"source_branch"`
	TargetBranch string `json:"target_branch"`
	ProjectID    int    `json:"project_id"`
	WebURL       string `json:"web_url"`
	DiffRefs     struct {
		BaseSha  string `json:"base_sha"`
		HeadSha  string `json:"head_sha"`
		StartSha string `json:"start_sha"`
	} `json:"diff_refs"`
	ChangesCount string         `json:"changes_count"`
	MergeStatus  string         `json:"merge_status"`
	CommitsCount int            `json:"commits_count"`
	Commits      []GitLabCommit `json:"commits,omitempty"`
}

// GitLabCommit GitLab Commit结构
type GitLabCommit struct {
	ID            string    `json:"id"`
	ShortID       string    `json:"short_id"`
	Title         string    `json:"title"`
	Message       string    `json:"message"`
	AuthorName    string    `json:"author_name"`
	AuthorEmail   string    `json:"author_email"`
	CreatedAt     time.Time `json:"created_at"`
	CommittedDate time.Time `json:"committed_date"`
}

// GitLabDiff GitLab差异文件结构
type GitLabDiff struct {
	OldPath     string `json:"old_path"`
	NewPath     string `json:"new_path"`
	AMode       string `json:"a_mode"`
	BMode       string `json:"b_mode"`
	Diff        string `json:"diff"`
	NewFile     bool   `json:"new_file"`
	RenamedFile bool   `json:"renamed_file"`
	DeletedFile bool   `json:"deleted_file"`
}

// GetCommitDiff 获取两个commit之间的差异
func (s *GitLabService) GetCommitDiff(projectID int, fromSha, toSha string) ([]GitLabDiff, error) {
	config, err := s.GetGitLabConfig()
	if err != nil {
		return nil, err
	}

	// 构建API URL
	apiURL := fmt.Sprintf("%s/api/v4/projects/%d/repository/compare?from=%s&to=%s", config.BaseURL, projectID, fromSha, toSha)

	// 创建HTTP请求
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 添加认证头 - 使用private-token
	req.Header.Set("private-token", config.Token)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitLab API请求失败: %s, 响应: %s", resp.Status, string(body))
	}

	// 解析响应
	var compareResult struct {
		Commits []GitLabCommit `json:"commits"`
		Diffs   []GitLabDiff   `json:"diffs"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&compareResult); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return compareResult.Diffs, nil
}

// GetPullRequestWithDiffs 获取Pull Request信息，包含最新commit与其他commits的差异
func (s *GitLabService) GetPullRequestWithDiffs(projectID int, pullRequestID int) (map[string]interface{}, error) {
	// 首先获取Pull Request基本信息
	pullRequest, err := s.GetPullRequest(projectID, pullRequestID)
	if err != nil {
		return nil, err
	}

	// 如果没有commits，直接返回基本信息
	if len(pullRequest.Commits) == 0 {
		return map[string]interface{}{
			"pull_request": pullRequest,
			"diffs":        []interface{}{},
		}, nil
	}

	// 获取最新commit的SHA
	latestCommit := pullRequest.Commits[0]
	latestSha := latestCommit.ID

	// 存储所有差异信息
	allDiffs := make(map[string][]GitLabDiff)

	// 将最新commit与每个其他commit进行比较
	for i := 1; i < len(pullRequest.Commits); i++ {
		otherCommit := pullRequest.Commits[i]
		otherSha := otherCommit.ID

		// 获取差异
		diffs, err := s.GetCommitDiff(projectID, otherSha, latestSha)
		if err != nil {
			// 如果获取差异失败，记录错误但继续处理其他commits
			fmt.Printf("获取commit差异失败 %s -> %s: %v\n", otherSha, latestSha, err)
			continue
		}

		// 使用commit的short_id作为key
		allDiffs[otherCommit.ShortID] = diffs
	}

	// 构建返回结果
	result := map[string]interface{}{
		"pull_request": pullRequest,
		"diffs":        allDiffs,
		"summary": map[string]interface{}{
			"total_commits":     len(pullRequest.Commits),
			"latest_commit":     latestCommit.ShortID,
			"latest_commit_sha": latestSha,
			"compared_commits":  len(allDiffs),
		},
	}

	return result, nil
}

// GetPullRequest 获取Pull Request信息
func (s *GitLabService) GetPullRequest(projectID int, pullRequestID int) (*GitLabPullRequest, error) {
	config, err := s.GetGitLabConfig()
	if err != nil {
		return nil, err
	}

	// 构建API URL
	apiURL := fmt.Sprintf("%s/api/v4/projects/%d/merge_requests/%d", config.BaseURL, projectID, pullRequestID)

	// 创建HTTP请求
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 添加认证头 - 使用private-token
	req.Header.Set("private-token", config.Token)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitLab API请求失败: %s, 响应: %s", resp.Status, string(body))
	}

	// 解析响应
	var pullRequest GitLabPullRequest
	if err := json.NewDecoder(resp.Body).Decode(&pullRequest); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	// 获取commits信息
	commits, err := s.GetPullRequestCommits(projectID, pullRequestID)
	if err != nil {
		// 如果获取commits失败，记录错误但不影响主请求
		fmt.Printf("获取commits失败: %v\n", err)
	} else {
		pullRequest.Commits = commits
		pullRequest.CommitsCount = len(commits)
	}

	return &pullRequest, nil
}

// GetPullRequestChanges 获取Pull Request的变更信息
func (s *GitLabService) GetPullRequestChanges(projectID int, pullRequestID int) ([]map[string]interface{}, error) {
	config, err := s.GetGitLabConfig()
	if err != nil {
		return nil, err
	}

	// 构建API URL
	apiURL := fmt.Sprintf("%s/api/v4/projects/%d/merge_requests/%d/changes", config.BaseURL, projectID, pullRequestID)

	// 创建HTTP请求
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 添加认证头 - 使用private-token
	req.Header.Set("private-token", config.Token)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitLab API请求失败: %s, 响应: %s", resp.Status, string(body))
	}

	// 解析响应
	var changes []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&changes); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return changes, nil
}

// GetPullRequestCommits 获取Pull Request的commits信息
func (s *GitLabService) GetPullRequestCommits(projectID int, pullRequestID int) ([]GitLabCommit, error) {
	config, err := s.GetGitLabConfig()
	if err != nil {
		return nil, err
	}

	// 构建API URL
	apiURL := fmt.Sprintf("%s/api/v4/projects/%d/merge_requests/%d/commits", config.BaseURL, projectID, pullRequestID)

	// 创建HTTP请求
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 添加认证头 - 使用private-token
	req.Header.Set("private-token", config.Token)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitLab API请求失败: %s, 响应: %s", resp.Status, string(body))
	}

	// 解析响应
	var commits []GitLabCommit
	if err := json.NewDecoder(resp.Body).Decode(&commits); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return commits, nil
}

// GetProjectByPath 根据路径获取项目信息
func (s *GitLabService) GetProjectByPath(path string) (map[string]interface{}, error) {
	config, err := s.GetGitLabConfig()
	if err != nil {
		return nil, err
	}

	// URL编码路径
	encodedPath := url.QueryEscape(path)

	// 构建API URL
	apiURL := fmt.Sprintf("%s/api/v4/projects/%s", config.BaseURL, encodedPath)

	// 创建HTTP请求
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 添加认证头 - 使用private-token
	req.Header.Set("private-token", config.Token)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitLab API请求失败: %s, 响应: %s", resp.Status, string(body))
	}

	// 解析响应
	var project map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&project); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return project, nil
}
