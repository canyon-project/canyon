package db

import (
	"backend/models"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB represents the database connection
var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() *gorm.DB {
	// Initialize ClickHouse first
	InitClickHouse()
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

	// Get database URL from environment
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Coverage{}, &models.Config{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize default config values
	initDefaultConfig(db)

	log.Println("数据库迁移完成")

	DB = db
	return db
}

// initDefaultConfig initializes default configuration values
func initDefaultConfig(db *gorm.DB) {
	defaultConfigs := map[string]string{
		"GITHUB_CLIENT_ID":     "x",
		"GITHUB_CLIENT_SECRET": "x",
		"GITHUB_REDIRECT_URL":  "http://localhost:5173/login",
		"JWT_SECRET":           "your-secure-jwt-secret-key",
	}

	for key, value := range defaultConfigs {
		var config models.Config
		result := db.Where("key = ?", key).First(&config)
		if result.Error != nil {
			// Config doesn't exist, create it
			config = models.Config{
				Key:   key,
				Value: value,
			}
			if err := db.Create(&config).Error; err != nil {
				log.Printf("Failed to create config %s: %v", key, err)
			} else {
				log.Printf("Created default config: %s", key)
			}
		}
	}
}

// GetConfig retrieves a configuration value by key
func GetConfig(key string) (string, error) {
	var config models.Config
	result := DB.Where("key = ?", key).First(&config)
	if result.Error != nil {
		return "", result.Error
	}
	return config.Value, nil
}

// SetConfig sets a configuration value
func SetConfig(key, value string) error {
	var config models.Config
	result := DB.Where("key = ?", key).First(&config)
	if result.Error != nil {
		// Config doesn't exist, create it
		config = models.Config{
			Key:   key,
			Value: value,
		}
		return DB.Create(&config).Error
	} else {
		// Config exists, update it
		config.Value = value
		return DB.Save(&config).Error
	}
}
