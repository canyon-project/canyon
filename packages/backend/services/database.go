package services

import (
	"backend/db"
)

// DatabaseService 数据库服务
type DatabaseService struct{}

// NewDatabaseService 创建数据库服务实例
func NewDatabaseService() *DatabaseService {
	return &DatabaseService{}
}

// TestConnection 测试数据库连接
func (s *DatabaseService) TestConnection() error {
	return db.HealthCheck()
}

// GetConnectionInfo 获取连接信息
func (s *DatabaseService) GetConnectionInfo() map[string]interface{} {
	sqlDB := db.GetSqlDB()
	stats := sqlDB.Stats()
	
	return map[string]interface{}{
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":              stats.InUse,
		"idle":                stats.Idle,
	}
}