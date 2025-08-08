package utils

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// SetupLogger 配置日志输出
func SetupLogger(logFile string) error {
	if logFile == "" {
		return nil
	}

	// 确保日志目录存在
	logDir := filepath.Dir(logFile)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	// 打开日志文件
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return err
	}

	// 设置日志输出到文件和控制台
	multiWriter := io.MultiWriter(os.Stdout, file)
	log.SetOutput(multiWriter)
	gin.DefaultWriter = multiWriter
	gin.DefaultErrorWriter = multiWriter

	return nil
}

// GenerateRequestID 生成随机的请求ID（16字节随机数的hex）
func GenerateRequestID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
