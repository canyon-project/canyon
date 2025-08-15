package services

import (
	"backend/db"
	"backend/models"
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"

	"gorm.io/gorm"
)

// GitHubService GitHub 服务
type GitHubService struct {
	db *gorm.DB
}

// NewGitHubService 创建 GitHub 服务
func NewGitHubService() *GitHubService {
	return &GitHubService{db: db.GetDB()}
}

type GitHubConfig struct {
	BaseURL string
	Token   string
}

// GetGitHubConfig 从配置表读取 GitHub 配置
func (s *GitHubService) GetGitHubConfig() (*GitHubConfig, error) {
	var baseURLConfig models.Config
	if err := s.db.Where("key = ?", "system_config.github_base_url").First(&baseURLConfig).Error; err != nil {
		return nil, fmt.Errorf("获取GitHub基础URL失败: %v", err)
	}
	var tokenConfig models.Config
	if err := s.db.Where("key = ?", "git_provider[0].private_token").First(&tokenConfig).Error; err != nil {
		return nil, fmt.Errorf("获取GitHub token失败: %v", err)
	}
	return &GitHubConfig{BaseURL: baseURLConfig.Value, Token: tokenConfig.Value}, nil
}

// GetProjectByPath owner/repo -> repository id (按需返回完整对象)
func (s *GitHubService) GetProjectByPath(pathWithNamespace string) (map[string]interface{}, error) {
	cfg, err := s.GetGitHubConfig()
	if err != nil {
		return nil, err
	}
	// GET /repos/{owner}/{repo}
	apiURL := fmt.Sprintf("%s/repos/%s", cfg.BaseURL, pathWithNamespace)
	resp, err := doJSONRequest("GET", apiURL, map[string]string{
		"Authorization": "Bearer " + cfg.Token,
		"Accept":        "application/vnd.github+json",
	})
	if err != nil {
		return nil, err
	}
	var out map[string]interface{}
	if err := decodeJSON(resp, &out); err != nil {
		return nil, err
	}
	return out, nil
}

// GetFileContentBase64 获取文件内容（base64）
func (s *GitHubService) GetFileContentBase64(ownerRepo string, sha string, filepath string) (string, error) {
	cfg, err := s.GetGitHubConfig()
	if err != nil {
		return "", err
	}
	// GET /repos/{owner}/{repo}/contents/{path}?ref={sha}
	apiURL := fmt.Sprintf("%s/repos/%s/contents/%s?ref=%s", cfg.BaseURL, ownerRepo, url.PathEscape(filepath), url.QueryEscape(sha))
	resp, err := doJSONRequest("GET", apiURL, map[string]string{
		"Authorization": "Bearer " + cfg.Token,
		"Accept":        "application/vnd.github.raw+json",
	})
	if err != nil {
		return "", err
	}
	var payload struct {
		Content  string `json:"content"`
		Encoding string `json:"encoding"`
	}
	if err := decodeJSON(resp, &payload); err != nil {
		return "", err
	}
	// GitHub 返回 content 可能包含换行，需要去掉再 base64 解码/或直接回传原始 base64
	if payload.Encoding == "base64" {
		cleaned := strings.ReplaceAll(payload.Content, "\n", "")
		return cleaned, nil
	}
	return base64.StdEncoding.EncodeToString([]byte(payload.Content)), nil
}

// GetCommitBySHA 获取单个 commit 详情（GitHub）
func (s *GitHubService) GetCommitBySHA(ownerRepo string, sha string) (*GitLabCommit, error) {
	cfg, err := s.GetGitHubConfig()
	if err != nil {
		return nil, err
	}
	apiURL := fmt.Sprintf("%s/repos/%s/commits/%s", cfg.BaseURL, ownerRepo, url.PathEscape(sha))
	resp, err := doJSONRequest("GET", apiURL, map[string]string{
		"Authorization": "Bearer " + cfg.Token,
		"Accept":        "application/vnd.github+json",
	})
	if err != nil {
		return nil, err
	}
	var payload struct {
		Sha    string `json:"sha"`
		Commit struct {
			Message string `json:"message"`
			Author  struct {
				Name  string `json:"name"`
				Email string `json:"email"`
				Date  string `json:"date"`
			} `json:"author"`
		} `json:"commit"`
	}
	if err := decodeJSON(resp, &payload); err != nil {
		return nil, err
	}
	out := &GitLabCommit{
		ID:          payload.Sha,
		ShortID:     payload.Sha,
		Title:       payload.Commit.Message,
		Message:     payload.Commit.Message,
		AuthorName:  payload.Commit.Author.Name,
		AuthorEmail: payload.Commit.Author.Email,
	}
	return out, nil
}
