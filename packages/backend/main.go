package main

import (
	"backend3/db"
	"backend3/handlers"
	"backend3/services"
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

	log.Println("启动 backend3 服务...")

	// Initialize database connection
	database := db.InitDB()

	// Initialize services
	coverageService := services.NewCoverageService(database)

	// Initialize handlers
	coverageHandler := handlers.NewCoverageHandler(coverageService)

	// 创建 Gin 路由器
	r := gin.Default()

	// 跨域中间件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 健康检查接口 - 放在外面
	r.GET("/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "服务运行正常",
			"service": "backend3",
		})
	})

	// 创建 v1 API 组
	v1 := r.Group("/api/v1")
	{
		// Coverage routes
		v1.GET("/coverage", coverageHandler.GetCoverageList)
		v1.GET("/coverage/:id", coverageHandler.GetCoverageByID)
	}

	// 启动服务器 - 允许所有IP访问
	serverAddr := "0.0.0.0:" + *port
	log.Printf("服务器启动在端口: %s，允许所有IP访问", *port)

    // 静态文件服务（放在最后，作为 fallback）
    r.Use(StaticFileHandler("/static"))

	r.Run(serverAddr)
}
