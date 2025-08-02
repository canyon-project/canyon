package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/joho/godotenv"
)

// ClickHouseDB represents the ClickHouse database connection
var ClickHouseDB driver.Conn

// InitClickHouse initializes the ClickHouse connection
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
			log.Printf("成功加载环境变量文件: %s", envPath)
			envLoaded = true
			break
		}
	}

	if !envLoaded {
		log.Println("未找到 .env 文件，使用系统环境变量")
	}

	// Get ClickHouse connection parameters from environment
	var host, port, database, username, password string
	
	// Try CLICKHOUSE_URL first
	clickhouseURL := os.Getenv("CLICKHOUSE_URL")
	if clickhouseURL != "" {
		parsedURL, err := url.Parse(clickhouseURL)
		if err != nil {
			log.Fatal("Failed to parse CLICKHOUSE_URL:", err)
		}
		
		host = parsedURL.Hostname()
		port = parsedURL.Port()
		if port == "" {
			port = "9000"
		}
		
		database = parsedURL.Path
		if database != "" && database[0] == '/' {
			database = database[1:] // Remove leading slash
		}
		if database == "" {
			database = "default"
		}
		
		username = parsedURL.User.Username()
		if username == "" {
			username = "default"
		}
		
		password, _ = parsedURL.User.Password()
	} else {
		// Fallback to individual environment variables
		host = os.Getenv("CLICKHOUSE_HOST")
		if host == "" {
			host = "localhost"
		}

		port = os.Getenv("CLICKHOUSE_PORT")
		if port == "" {
			port = "9000"
		}

		database = os.Getenv("CLICKHOUSE_DATABASE")
		if database == "" {
			database = "default"
		}

		username = os.Getenv("CLICKHOUSE_USERNAME")
		if username == "" {
			username = "default"
		}

		password = os.Getenv("CLICKHOUSE_PASSWORD")
		if password == "" {
			password = ""
		}
	}

	// Create connection
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%s", host, port)},
		Auth: clickhouse.Auth{
			Database: database,
			Username: username,
			Password: password,
		},
		DialTimeout: time.Second * 30,
		Compression: &clickhouse.Compression{
			Method: clickhouse.CompressionLZ4,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
	})

	if err != nil {
		log.Fatal("Failed to connect to ClickHouse:", err)
	}

	// Test connection
	if err := conn.Ping(context.Background()); err != nil {
		log.Fatal("Failed to ping ClickHouse:", err)
	}

	log.Println("ClickHouse连接成功")

	ClickHouseDB = conn
	return conn
}



// GetClickHouseStdConn returns a standard database/sql connection for compatibility
func GetClickHouseStdConn() *sql.DB {
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

	var dsn string
	
	// Try CLICKHOUSE_URL first
	clickhouseURL := os.Getenv("CLICKHOUSE_URL")
	if clickhouseURL != "" {
		dsn = clickhouseURL
	} else {
		// Fallback to individual environment variables
		host := os.Getenv("CLICKHOUSE_HOST")
		if host == "" {
			host = "localhost"
		}

		port := os.Getenv("CLICKHOUSE_PORT")
		if port == "" {
			port = "9000"
		}

		database := os.Getenv("CLICKHOUSE_DATABASE")
		if database == "" {
			database = "default"
		}

		username := os.Getenv("CLICKHOUSE_USERNAME")
		if username == "" {
			username = "default"
		}

		password := os.Getenv("CLICKHOUSE_PASSWORD")

		dsn = fmt.Sprintf("clickhouse://%s:%s@%s:%s/%s", username, password, host, port, database)
	}
	
	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		log.Fatal("Failed to open ClickHouse standard connection:", err)
	}

	return db
}