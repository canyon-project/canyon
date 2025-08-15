package services

import (
	"fmt"
	"strconv"
)

// VCS 抽象接口，统一不同代码托管商
type VCS interface {
	GetProjectByPath(path string) (map[string]interface{}, error)
	GetFileContentBase64(project string, sha string, filepath string) (string, error)
	GetCommitBySHA(project string, sha string) (*GitLabCommit, error)
}

func VCSFor(provider string) VCS {
	switch provider {
	case "github":
		return &githubAdapter{s: NewGitHubService()}
	case "gitea":
		return &giteaAdapter{s: NewGiteaService()}
	default:
		return &gitlabAdapter{s: NewGitLabService()}
	}
}

// GitLab 适配器
type gitlabAdapter struct{ s *GitLabService }

func (a *gitlabAdapter) GetProjectByPath(path string) (map[string]interface{}, error) {
	return a.s.GetProjectByPath(path)
}

func (a *gitlabAdapter) GetFileContentBase64(project string, sha string, filepath string) (string, error) {
	// project 允许为数字ID或 path_with_namespace
	if pid, err := strconv.Atoi(project); err == nil {
		return a.s.GetFileContentBase64(pid, sha, filepath)
	}
	// 否则先通过路径获取项目ID
	proj, err := a.s.GetProjectByPath(project)
	if err != nil {
		return "", err
	}
	idVal, ok := proj["id"].(float64)
	if !ok {
		return "", fmt.Errorf("无法解析GitLab项目ID")
	}
	return a.s.GetFileContentBase64(int(idVal), sha, filepath)
}

func (a *gitlabAdapter) GetCommitBySHA(project string, sha string) (*GitLabCommit, error) {
	if pid, err := strconv.Atoi(project); err == nil {
		return a.s.GetCommitBySHA(pid, sha)
	}
	proj, err := a.s.GetProjectByPath(project)
	if err != nil {
		return nil, err
	}
	idVal, ok := proj["id"].(float64)
	if !ok {
		return nil, fmt.Errorf("无法解析GitLab项目ID")
	}
	return a.s.GetCommitBySHA(int(idVal), sha)
}

// GitHub 适配器
type githubAdapter struct{ s *GitHubService }

func (a *githubAdapter) GetProjectByPath(path string) (map[string]interface{}, error) {
	return a.s.GetProjectByPath(path)
}

func (a *githubAdapter) GetFileContentBase64(project string, sha string, filepath string) (string, error) {
	// project 为 owner/repo
	return a.s.GetFileContentBase64(project, sha, filepath)
}

func (a *githubAdapter) GetCommitBySHA(project string, sha string) (*GitLabCommit, error) {
	return a.s.GetCommitBySHA(project, sha)
}

// Gitea 适配器
type giteaAdapter struct{ s *GiteaService }

func (a *giteaAdapter) GetProjectByPath(path string) (map[string]interface{}, error) {
	return a.s.GetProjectByPath(path)
}

func (a *giteaAdapter) GetFileContentBase64(project string, sha string, filepath string) (string, error) {
	return a.s.GetFileContentBase64(project, sha, filepath)
}

func (a *giteaAdapter) GetCommitBySHA(project string, sha string) (*GitLabCommit, error) {
	// Gitea commit API 结构与 GitHub 类似，后续可完善；先返回占位错误或简单实现
	// 这里返回通用错误以便调用方降级
	return nil, fmt.Errorf("Gitea 暂未实现 GetCommitBySHA")
}
