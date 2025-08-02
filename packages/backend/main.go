package main

import (
	"backend/config"
	"backend/db"
	"backend/handlers"
	"backend/middleware"
	"backend/services"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"github.com/gin-gonic/gin"
)

// StaticFileHandler 处理静态文件服务，支持 SPA 路由
func StaticFileHandler(staticPath string) gin.HandlerFunc {
	fileServer := http.FileServer(http.Dir(staticPath))

	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// 如果是 API 请求，跳过静态文件处理
		if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/health") {
			c.Next()
			return
		}

		// 检查文件是否存在
		fullPath := filepath.Join(staticPath, path)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			// 如果文件不存在，返回 index.html（支持 SPA 路由）
			c.Request.URL.Path = "/"
		}

		fileServer.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	}
}

func main() {
	// 解析命令行参数
	var logFile = flag.String("log", "", "日志文件路径")
	var port = flag.String("port", "8080", "服务端口")
	flag.Parse()

	// 配置日志输出
	if *logFile != "" {
		// 确保日志目录存在
		logDir := filepath.Dir(*logFile)
		if err := os.MkdirAll(logDir, 0755); err != nil {
			log.Fatal("创建日志目录失败:", err)
		}

		// 打开日志文件
		file, err := os.OpenFile(*logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Fatal("打开日志文件失败:", err)
		}
		defer file.Close()

		// 设置日志输出到文件和控制台
		multiWriter := io.MultiWriter(os.Stdout, file)
		log.SetOutput(multiWriter)
		gin.DefaultWriter = multiWriter
		gin.DefaultErrorWriter = multiWriter

		log.Printf("日志输出到: %s", *logFile)
	}

	log.Println("启动 backend 服务...")

	// Initialize database connection
	database := db.InitDB()

	// Initialize OAuth configuration from database
	config.InitOAuthConfig()

	// Initialize services
	coverageService := services.NewCoverageService(database)
	authService := services.NewAuthService(database)

	// Initialize handlers
	coverageHandler := handlers.NewCoverageHandler(coverageService)
	clickhouseCoverageHandler := handlers.NewClickHouseCoverageHandler() // ClickHouse handler
	authHandler := handlers.NewAuthHandler(authService)
	configHandler := handlers.NewConfigHandler()

	// 创建 Gin 路由器
	r := gin.Default()

	// 使用中间件
	r.Use(middleware.CORS())
	r.Use(middleware.ErrorHandler())

	// 健康检查接口 - 放在外面
	r.GET("/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "服务运行正常",
			"service": "backend",
		})
	})

	// 创建 v1 API 组
	v1 := r.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.GET("/github", authHandler.GitHubLogin)
			auth.POST("/github/callback", authHandler.GitHubCallback)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(handlers.AuthMiddleware())
		{
			protected.GET("/profile", authHandler.GetProfile)
			
			// Config management routes (protected)
			protected.GET("/config", configHandler.ListConfigs)
			protected.GET("/config/:key", configHandler.GetConfig)
			protected.POST("/config", configHandler.SetConfig)
		}

		// Coverage routes (existing)
		v1.GET("/coverage", coverageHandler.GetCoverageList)
		v1.GET("/coverage/:id", coverageHandler.GetCoverageByID)
		
		// ClickHouse Coverage routes (new)
		clickhouse := v1.Group("/clickhouse")
		{
			clickhouse.POST("/coverage/hit", clickhouseCoverageHandler.PostCoverageHit)
			clickhouse.POST("/coverage/hits/batch", clickhouseCoverageHandler.PostCoverageHitsBatch)
			clickhouse.POST("/coverage/map", clickhouseCoverageHandler.PostCoverageMap)
			clickhouse.GET("/coverage/map/:hash", clickhouseCoverageHandler.GetCoverageMap)
			clickhouse.GET("/coverage/:coverage_id/aggregation", clickhouseCoverageHandler.GetCoverageAggregation)
			clickhouse.GET("/coverage/:coverage_id/hits", clickhouseCoverageHandler.GetCoverageHits)
		}
	}

	// 启动服务器 - 允许所有IP访问
	serverAddr := "0.0.0.0:" + *port
	log.Printf("服务器启动在端口: %s，允许所有IP访问", *port)

    // 静态文件服务（放在最后，作为 fallback）
    r.Use(StaticFileHandler("/static"))

	r.Run(serverAddr)
}
