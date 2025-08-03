package db

import (
	"context"
	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"log"
	"
)

// ClickHouseDB represents the ClickHouse database connection
var ClickHouseDB driver.Conn

// InitClickHouse initializes the ClickHouse connection using HTTP protocol
func InitClickHouse() driver.Conn {
	// 从环境变量获取配置，如果没有则使用默认值
	clickhouseHost := os.Getenv("CLICKHOUSE_HOST")
	if clickhouseHost == "" {
		clickhouseHost = "127.0.0.1:8123"
	}


	if clickhouseUser == "" {
		clickhouseUser = "default"
	}


	if clickhousePassword == "" {
		clickhousePassword = "123456" // 默认密码
	}


	if clickhouseDatabase == "" {
		clickhouseDatabase = "default"
	}

	log.Printf("尝试连接 ClickHouse: %s, 用户: %s, 数据库: %s", clickhouseHost, clickhouseUser, clickhouseDatabase)

	// 使用 HTTP 协议连接 ClickHouse
	log.Printf("尝试使用 HTTP 协议连接: %s", clickhouseHost)


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


		log.Printf("ClickHouse ping 失败: %v", err)
		log.Fatal("Failed to ping ClickHouse:", err)
	}

	log.Println("ClickHouse HTTP 连接成功")

	ClickHouseDB = conn
	return conn
}
