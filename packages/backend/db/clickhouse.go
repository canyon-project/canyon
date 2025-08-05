package db

import (
	"backend/config"
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

var (
	ClickHouseDB driver.Conn
	ClickHouseSqlDB *sql.DB
)

// InitClickHouse 初始化ClickHouse连接
func InitClickHouse() driver.Conn {
	cfg := config.AppConfig
	if cfg == nil {
		log.Fatal("配置未初始化，请先调用 config.LoadConfig()")
	}

	if cfg.ClickHouseHost == "" {
		log.Fatal("CLICKHOUSE_HOST 未配置")
	}

	// 构建连接选项
	options := &clickhouse.Options{
		Addr: []string{cfg.ClickHouseHost},
		Auth: clickhouse.Auth{
			Database: cfg.ClickHouseDatabase,
			Username: cfg.ClickHouseUser,
			Password: cfg.ClickHousePassword,
		},
		Protocol: clickhouse.HTTP, // 使用HTTP协议
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:      time.Second * 30,
		MaxOpenConns:     10,
		MaxIdleConns:     5,
		ConnMaxLifetime:  time.Hour,
		ConnOpenStrategy: clickhouse.ConnOpenInOrder,
	}

	// 建立连接
	conn, err := clickhouse.Open(options)
	if err != nil {
		log.Fatalf("连接ClickHouse失败: %v", err)
	}

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := conn.Ping(ctx); err != nil {
		log.Fatalf("ClickHouse连接测试失败: %v", err)
	}

	log.Println("ClickHouse连接成功")

	// 设置全局变量
	ClickHouseDB = conn

	// 也创建一个标准的sql.DB连接用于某些场景
	sqlDB := clickhouse.OpenDB(options)
	ClickHouseSqlDB = sqlDB

	return conn
}

// GetClickHouseDB 获取ClickHouse连接
func GetClickHouseDB() driver.Conn {
	if ClickHouseDB == nil {
		log.Fatal("ClickHouse数据库未初始化")
	}
	return ClickHouseDB
}

// GetClickHouseSqlDB 获取ClickHouse SQL连接
func GetClickHouseSqlDB() *sql.DB {
	if ClickHouseSqlDB == nil {
		log.Fatal("ClickHouse SQL数据库未初始化")
	}
	return ClickHouseSqlDB
}

// CloseClickHouse 关闭ClickHouse连接
func CloseClickHouse() error {
	if ClickHouseDB != nil {
		if err := ClickHouseDB.Close(); err != nil {
			return err
		}
	}
	if ClickHouseSqlDB != nil {
		if err := ClickHouseSqlDB.Close(); err != nil {
			return err
		}
	}
	return nil
}

// ClickHouseHealthCheck ClickHouse健康检查
func ClickHouseHealthCheck() error {
	if ClickHouseDB == nil {
		return fmt.Errorf("ClickHouse连接未初始化")
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	return ClickHouseDB.Ping(ctx)
}