package db

import (
	"context"
	"os"
	"time"
	"log"
	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/joho/godotenv"
)

// ClickHouseDB represents the ClickHouse database connection
var ClickHouseDB driver.Conn

// ClickHouseClient is an alias for ClickHouseDB for compatibility
var ClickHouseClient driver.Conn

// InitClickHouse initializes the ClickHouse connection using HTTP protocol
func InitClickHouse() driver.Conn {
	// Load environment variables - 尝试多个可能的路径
	envPaths := []string{
		".env",          // 当前目录
		"/opt/app/.env", // 部署目录
		"../../.env",    // 上级目录
	}

	envLoaded := false
	for _, envPath := range envPaths {
		if err := godotenv.Load(envPath); err == nil {
			log.Printf("ClickHouse: 成功加载环境变量文件: %s", envPath)
			envLoaded = true
			break
		}
	}

	if !envLoaded {
		log.Println("ClickHouse: 未找到 .env 文件，使用系统环境变量")
	}

	// 从环境变量获取配置，如果没有则使用默认值
	clickhouseHost := os.Getenv("CLICKHOUSE_HOST")
	if clickhouseHost == "" {
		clickhouseHost = "127.0.0.1:8123"
	}

	clickhouseUser := os.Getenv("CLICKHOUSE_USER")
	if clickhouseUser == "" {
		clickhouseUser = "default"
	}

	clickhousePassword := os.Getenv("CLICKHOUSE_PASSWORD")
	if clickhousePassword == "" {
		clickhousePassword = "123456" // 默认密码
	}

	clickhouseDatabase := os.Getenv("CLICKHOUSE_DATABASE")
	if clickhouseDatabase == "" {
		clickhouseDatabase = "default"
	}

	log.Printf("尝试连接 ClickHouse: %s, 用户: %s, 数据库: %s", clickhouseHost, clickhouseUser, clickhouseDatabase)

	// 使用 HTTP 协议连接 ClickHouse
	log.Printf("尝试使用 HTTP 协议连接: %s", clickhouseHost)

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{clickhouseHost},
		Auth: clickhouse.Auth{
			Database: clickhouseDatabase,
			Username: clickhouseUser,
			Password: clickhousePassword,
		},
		Protocol: clickhouse.HTTP, // 使用 HTTP 协议
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:      30 * time.Second,
		MaxOpenConns:     5,
		MaxIdleConns:     5,
		ConnMaxLifetime:  time.Hour,
		ConnOpenStrategy: clickhouse.ConnOpenInOrder,
	})

	if err != nil {
		log.Printf("连接 ClickHouse 失败: %v", err)
		log.Fatal("Failed to connect to ClickHouse:", err)
	}

	log.Println("ClickHouse 连接创建成功，开始测试连接...")

	// Test connection with context timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := conn.Ping(ctx); err != nil {
		log.Printf("ClickHouse ping 失败: %v", err)
		log.Fatal("Failed to ping ClickHouse:", err)
	}

	log.Println("ClickHouse HTTP 连接成功")

	ClickHouseDB = conn
	ClickHouseClient = conn // Set the client alias
	return conn
}
