package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	GitHubID    int64  `json:"github_id" gorm:"column:github_id;uniqueIndex;not null"`
	Username    string `json:"username" gorm:"not null"`
	Email       string `json:"email"`
	AvatarURL   string `json:"avatar_url"`
	Name        string `json:"name"`
	Bio         string `json:"bio"`
	Location    string `json:"location"`
	Company     string `json:"company"`
	Blog        string `json:"blog"`
	AccessToken string `json:"-" gorm:"type:text"`
}

type Config struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	Key   string `json:"key" gorm:"uniqueIndex;not null"`
	Value string `json:"value" gorm:"type:text;not null"`
}