package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnv 加载环境变量文件
func LoadEnv() {
	// Load environment variables - 尝试多个可能的路径
	envPaths := []string{
		".env",          // 当前目录
		"/opt/app/.env", // 部署目录
		"../../.env",    // 上级目录
	}

	envLoaded := false
	for _, envPath := range envPaths {
		if err := godotenv.Load(envPath); err == nil {
			log.Printf("成功加载环境变量文件: %s", envPath)
			envLoaded = true
			break
		}
	}

	if !envLoaded {
		log.Println("未找到 .env 文件，使用系统环境变量")
	}
}

// GetEnv 获取环境变量，如果不存在则返回默认值
func GetEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetRequiredEnv 获取必需的环境变量，如果不存在则终止程序
func GetRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("%s environment variable is required", key)
	}
	return value
}