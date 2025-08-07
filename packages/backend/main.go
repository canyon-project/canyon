// Package main Canyon Backend API
//
// Canyon 是一个代码覆盖率管理平台的后端服务
//
//	Schemes: http, https
//	Host: localhost:8080
//	BasePath: /api
//	Version: 1.0.0
//
//	Consumes:
//	- application/json
//
//	Produces:
//	- application/json
//
//	Security:
//	- bearer
//
// swagger:meta
package main

import (
	_ "backend/docs" // 导入 Swagger 文档
	"backend/server"
	"backend/utils"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
)

// @title Canyon Backend API
// @version 1.0
// @description Canyon 代码覆盖率管理平台后端 API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// 解析命令行参数
	var logFile = flag.String("log", "", "日志文件路径")
	var port = flag.String("port", "8080", "服务端口")
	flag.Parse()

	// 配置日志输出
	if err := utils.SetupLogger(*logFile); err != nil {
		log.Fatal("配置日志失败:", err)
	}

	// 创建服务器实例
	srv := server.NewServer()

	// 初始化服务器
	if err := srv.Initialize(); err != nil {
		log.Fatal("初始化服务器失败:", err)
	}

	// 设置优雅关闭
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		<-c

		if err := srv.Shutdown(); err != nil {
			log.Printf("服务器关闭失败: %v", err)
		}
		os.Exit(0)
	}()

	// 启动服务器
	if err := srv.Start(*port); err != nil {
		log.Fatal("启动服务器失败:", err)
	}
}
