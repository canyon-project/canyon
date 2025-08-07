package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
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

	for _, envPath := range envPaths {
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				// 静默处理环境变量文件加载失败
			} else {
				break
			}
		}
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
