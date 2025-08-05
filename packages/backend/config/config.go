package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL        string
	ClickHouseHost     string
	ClickHouseUser     string
	ClickHousePassword string
	ClickHouseDatabase string
	Port               string
}

var AppConfig *Config

// LoadConfig 加载配置
func LoadConfig() *Config {
	// Load environment variables - 尝试多个可能的路径
	envPaths := []string{
		".env",          // 当前目录
		"/opt/app/.env", // 部署目录
		"../../.env",    // 上级目录
	}

	var envLoaded bool
	for _, envPath := range envPaths {
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				log.Printf("警告: 无法加载环境变量文件 %s: %v", envPath, err)
			} else {
				log.Printf("成功加载环境变量文件: %s", envPath)
				envLoaded = true
				break
			}
		}
	}

	if !envLoaded {
		log.Println("警告: 未找到环境变量文件，将使用系统环境变量")
	}

	config := &Config{
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		ClickHouseHost:     getEnv("CLICKHOUSE_HOST", ""),
		ClickHouseUser:     getEnv("CLICKHOUSE_USER", ""),
		ClickHousePassword: getEnv("CLICKHOUSE_PASSWORD", ""),
		ClickHouseDatabase: getEnv("CLICKHOUSE_DATABASE", "default"),
		Port:               getEnv("PORT", "8080"),
	}

	// 验证必需的配置
	if config.DatabaseURL == "" {
		log.Fatal("DATABASE_URL 环境变量未设置")
	}

	AppConfig = config
	return config
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetWorkingDir 获取工作目录
func GetWorkingDir() string {
	wd, err := os.Getwd()
	if err != nil {
		log.Printf("获取工作目录失败: %v", err)
		return "."
	}
	return wd
}

// GetAbsolutePath 获取绝对路径
func GetAbsolutePath(relativePath string) string {
	absPath, err := filepath.Abs(relativePath)
	if err != nil {
		log.Printf("获取绝对路径失败: %v", err)
		return relativePath
	}
	return absPath
}