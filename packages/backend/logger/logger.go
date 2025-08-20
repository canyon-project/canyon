package logger

import (
	"log"

	"go.uber.org/zap"
)

var l *zap.Logger

// Init 初始化本地日志器（zap），失败则退回标准库
func Init() {
	cfg := zap.NewDevelopmentConfig()
	cfg.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	logger, err := cfg.Build()
	if err != nil {
		log.Printf("fallback to std logger due to zap init error: %v", err)
		l = nil
		return
	}
	l = logger
}

// Info 输出 Info 日志
func Info(msg string, fields ...zap.Field) {
	if l != nil {
		l.Info(msg, fields...)
		return
	}
	if len(fields) == 0 {
		log.Println(msg)
		return
	}
	log.Printf("%s %v", msg, fields)
}

// With 生成带公共字段的 logger
func With(fields ...zap.Field) *zap.Logger {
	if l != nil {
		return l.With(fields...)
	}
	return zap.NewNop()
}

// UpdateConfig 本地版本为 no-op（公司版本会覆盖为真实实现）
func UpdateConfig(_ ...interface{}) {}

// FieldScenarioID 本地版本返回空字段（公司版本会覆盖为真实实现）
func FieldScenarioID() zap.Field { return zap.Skip() }
