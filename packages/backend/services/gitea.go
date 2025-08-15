package services

import (
	"backend/db"
	"backend/models"
	"fmt"
	"net/url"

	"gorm.io/gorm"
)

// GiteaService Gitea 服务
type GiteaService struct {
	db *gorm.DB
}

// NewGiteaService 创建 Gitea 服务
func NewGiteaService() *GiteaService {
	return &GiteaService{db: db.GetDB()}
}

type GiteaConfig struct {
	BaseURL string
	Token   string
}

// GetGiteaConfig 从配置表读取 Gitea 配置
func (s *GiteaService) GetGiteaConfig() (*GiteaConfig, error) {
	var baseURLConfig models.Config
	if err := s.db.Where("key = ?", "system_config.gitea_base_url").First(&baseURLConfig).Error; err != nil {
		return nil, fmt.Errorf("获取Gitea基础URL失败: %v", err)
	}
	var tokenConfig models.Config
	if err := s.db.Where("key = ?", "git_provider[0].private_token").First(&tokenConfig).Error; err != nil {
		return nil, fmt.Errorf("获取Gitea token失败: %v", err)
	}
	return &GiteaConfig{BaseURL: baseURLConfig.Value, Token: tokenConfig.Value}, nil
}

// GetProjectByPath owner/repo
func (s *GiteaService) GetProjectByPath(pathWithNamespace string) (map[string]interface{}, error) {
	cfg, err := s.GetGiteaConfig()
	if err != nil {
		return nil, err
	}
	// GET /api/v1/repos/{owner}/{repo}
	apiURL := fmt.Sprintf("%s/api/v1/repos/%s", cfg.BaseURL, pathWithNamespace)
	resp, err := doJSONRequest("GET", apiURL, map[string]string{
		"Authorization": "token " + cfg.Token,
		"Accept":        "application/json",
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

// GetFileContentBase64 获取文件内容（base64），Gitea 与 GitHub 相似
func (s *GiteaService) GetFileContentBase64(ownerRepo string, sha string, filepath string) (string, error) {
	cfg, err := s.GetGiteaConfig()
	if err != nil {
		return "", err
	}
	// GET /api/v1/repos/{owner}/{repo}/contents/{filepath}?ref={sha}
	apiURL := fmt.Sprintf("%s/api/v1/repos/%s/contents/%s?ref=%s", cfg.BaseURL, ownerRepo, url.PathEscape(filepath), url.QueryEscape(sha))
	resp, err := doJSONRequest("GET", apiURL, map[string]string{
		"Authorization": "token " + cfg.Token,
		"Accept":        "application/json",
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
	// 直接返回 base64 字符串
	return payload.Content, nil
}
