package db

import (
	"backend/config"
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB    *gorm.DB
	SqlDB *sql.DB
)

// InitDB 初始化数据库连接
func InitDB() *gorm.DB {
	cfg := config.AppConfig
	if cfg == nil {
		log.Fatal("配置未初始化，请先调用 config.LoadConfig()")
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL 未配置")
	}

	// 连接数据库
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}

	// 获取底层的 sql.DB 对象
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("获取数据库连接失败: %v", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxIdleConns(10)           // 最大空闲连接数
	sqlDB.SetMaxOpenConns(100)          // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Hour) // 连接最大生存时间

	// 测试数据库连接
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("数据库连接测试失败: %v", err)
	}

	// 设置全局变量
	DB = db
	SqlDB = sqlDB

	return db
}

// GetDB 获取数据库连接
func GetDB() *gorm.DB {
	if DB == nil {
		log.Fatal("数据库未初始化")
	}
	return DB
}

// GetSqlDB 获取原生SQL数据库连接
func GetSqlDB() *sql.DB {
	if SqlDB == nil {
		log.Fatal("数据库未初始化")
	}
	return SqlDB
}

// Close 关闭数据库连接
func Close() error {
	if SqlDB != nil {
		return SqlDB.Close()
	}
	return nil
}

// HealthCheck 数据库健康检查
func HealthCheck() error {
	if SqlDB == nil {
		return fmt.Errorf("数据库连接未初始化")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return SqlDB.PingContext(ctx)
}
