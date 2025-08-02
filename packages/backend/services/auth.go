package services

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

type GitHubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
	Bio       string `json:"bio"`
	Location  string `json:"location"`
	Company   string `json:"company"`
	Blog      string `json:"blog"`
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

// GetOrCreateUser 获取或创建用户
func (s *AuthService) GetOrCreateUser(token *oauth2.Token) (*models.User, error) {
	// 使用token获取GitHub用户信息
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var githubUser GitHubUser
	if err := json.NewDecoder(resp.Body).Decode(&githubUser); err != nil {
		return nil, err
	}

	// 查找或创建用户
	var user models.User
	result := s.db.Where("github_id = ?", githubUser.ID).First(&user)

	if result.Error == gorm.ErrRecordNotFound {
		// 创建新用户
		user = models.User{
			GitHubID:    githubUser.ID,
			Username:    githubUser.Login,
			Email:       githubUser.Email,
			Name:        githubUser.Name,
			AvatarURL:   githubUser.AvatarURL,
			Bio:         githubUser.Bio,
			Location:    githubUser.Location,
			Company:     githubUser.Company,
			Blog:        githubUser.Blog,
			AccessToken: token.AccessToken,
		}

		if err := s.db.Create(&user).Error; err != nil {
			return nil, err
		}
	} else if result.Error != nil {
		return nil, result.Error
	} else {
		// 更新现有用户信息
		user.Username = githubUser.Login
		user.Email = githubUser.Email
		user.Name = githubUser.Name
		user.AvatarURL = githubUser.AvatarURL
		user.Bio = githubUser.Bio
		user.Location = githubUser.Location
		user.Company = githubUser.Company
		user.Blog = githubUser.Blog
		user.AccessToken = token.AccessToken

		if err := s.db.Save(&user).Error; err != nil {
			return nil, err
		}
	}

	return &user, nil
}

// GenerateJWT 生成JWT token
func (s *AuthService) GenerateJWT(user *models.User) (string, error) {
	return utils.GenerateToken(user.ID, user.Username)
}

// GetUserByID 根据ID获取用户
func (s *AuthService) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
