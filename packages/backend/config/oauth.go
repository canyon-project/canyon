package config

import (
	"backend/db"
	"log"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

var GitHubOAuthConfig *oauth2.Config

// InitOAuthConfig initializes OAuth configuration from database
func InitOAuthConfig() {
	clientID, err := db.GetConfig("GITHUB_CLIENT_ID")
	if err != nil {
		log.Printf("Failed to get GITHUB_CLIENT_ID from database: %v", err)
		clientID = "xxx"
	}

	clientSecret, err := db.GetConfig("GITHUB_CLIENT_SECRET")
	if err != nil {
		log.Printf("Failed to get GITHUB_CLIENT_SECRET from database: %v", err)
		clientSecret = "xxx"
	}

	redirectURL, err := db.GetConfig("GITHUB_REDIRECT_URL")
	if err != nil {
		log.Printf("Failed to get GITHUB_REDIRECT_URL from database: %v", err)
		redirectURL = "http://localhost:5173/login"
	}

	GitHubOAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"user:email"},
		Endpoint:     github.Endpoint,
	}

	log.Println("OAuth配置已从数据库加载")
}

// GetJWTSecret retrieves JWT secret from database
func GetJWTSecret() string {
	secret, err := db.GetConfig("JWT_SECRET")
	if err != nil {
		log.Printf("Failed to get JWT_SECRET from database: %v", err)
		return "your-secure-jwt-secret-key"
	}
	return secret
}
