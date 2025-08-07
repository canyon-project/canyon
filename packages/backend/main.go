package main

import (
	"backend/server"
	"backend/utils"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
)

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
