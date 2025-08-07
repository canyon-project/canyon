package server

import (
	"backend/config"
	"backend/db"
	"backend/middleware"
	"backend/routes"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Server 服务器结构
type Server struct {
	Router   *gin.Engine
	Database *gorm.DB
	Config   *config.Config
}

// NewServer 创建新的服务器实例
func NewServer() *Server {
	return &Server{}
}

// Initialize 初始化服务器
func (s *Server) Initialize() error {
	// 加载配置
	s.Config = config.LoadConfig()

	// 初始化PostgreSQL数据库连接
	s.Database = db.InitDB()

	// 初始化ClickHouse连接（如果配置了的话）
	if s.Config.ClickHouseHost != "" {
		db.InitClickHouse()
	}

	// 创建 Gin 路由器
	s.Router = gin.Default()

	// 设置中间件
	s.setupMiddleware()

	// 设置路由
	s.setupRoutes()

	return nil
}

// setupMiddleware 设置中间件
func (s *Server) setupMiddleware() {
	s.Router.Use(middleware.CORS())
	s.Router.Use(middleware.ErrorHandler())
}

// setupRoutes 设置路由
func (s *Server) setupRoutes() {
	// 设置所有路由
	routes.SetupRoutes(s.Router)

	// 静态文件服务（放在最后，作为 fallback）
	s.Router.Use(middleware.StaticFileHandler("/static"))
}

// Start 启动服务器
func (s *Server) Start(port string) error {
	// 如果端口为默认值，使用配置中的端口
	if port == "8080" && s.Config != nil {
		port = s.Config.Port
	}

	serverAddr := "0.0.0.0:" + port

	return s.Router.Run(serverAddr)
}

// Shutdown 关闭服务器
func (s *Server) Shutdown() error {
	// 关闭PostgreSQL连接
	if err := db.Close(); err != nil {
		log.Printf("关闭PostgreSQL连接失败: %v", err)
		return err
	}

	// 关闭ClickHouse连接
	if err := db.CloseClickHouse(); err != nil {
		log.Printf("关闭ClickHouse连接失败: %v", err)
		return err
	}

	return nil
}
