package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
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
	if password == "" {
		password = ""
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

	// Initialize tables
	if err := initClickHouseTables(conn); err != nil {
		log.Fatal("Failed to initialize ClickHouse tables:", err)
	}

	ClickHouseDB = conn
	return conn
}

// initClickHouseTables creates the necessary tables
func initClickHouseTables(conn driver.Conn) error {
	ctx := context.Background()

	// Execute each statement
	statements := []string{
		`CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  coverage_id     String,
  full_file_path       String,
  s               Map(UInt32, UInt32),
  f               Map(UInt32, UInt32),
  b               Map(UInt32, UInt32),
  ts              DateTime
  ) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (ts)
  TTL ts + toIntervalHour(12)`,

		`CREATE TABLE IF NOT EXISTS default.coverage_map
(
  hash     String,
  statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  restore_statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  restore_fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  restore_branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  ts              DateTime
  ) ENGINE = ReplacingMergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (hash)
  TTL ts + toIntervalHour(720)
  SETTINGS index_granularity = 8192`,

		`CREATE TABLE IF NOT EXISTS default.coverage_hit_agg
(
  coverage_id String,
  full_file_path   String,
  s       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  f       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  b       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  latest_ts   SimpleAggregateFunction(max, DateTime)
  )
  ENGINE = AggregatingMergeTree()
  PARTITION BY toYYYYMM(latest_ts)
  ORDER BY (coverage_id, full_file_path)`,

		`CREATE MATERIALIZED VIEW IF NOT EXISTS default.coverage_hit_mv
            TO default.coverage_hit_agg
AS
SELECT
  coverage_id,
  full_file_path,
  sumMapState(mapKeys(s), mapValues(s)) AS s,
  sumMapState(mapKeys(f), mapValues(f)) AS f,
  sumMapState(mapKeys(b), mapValues(b)) AS b,
  max(ts) AS latest_ts
FROM default.coverage_hit
GROUP BY coverage_id, full_file_path`,
	}

	for _, stmt := range statements {
		if err := conn.Exec(ctx, stmt); err != nil {
			log.Printf("Failed to execute statement: %v", err)
			return err
		}
	}

	log.Println("ClickHouse表初始化完成")
	return nil
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

	dsn := fmt.Sprintf("clickhouse://%s:%s@%s:%s/%s", username, password, host, port, database)
	
	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		log.Fatal("Failed to open ClickHouse standard connection:", err)
	}

	return db
}