package services

import (
    "gorm.io/gorm"
)

// BaseService 基础服务，提供通用的数据库连接
type BaseService struct {
    db *gorm.DB
}

// GetDB 获取数据库连接
func (s *BaseService) GetDB() *gorm.DB {
    return s.db
}

// WithTx 在事务中执行操作
func (s *BaseService) WithTx(fn func(*gorm.DB) error) error {
    return s.db.Transaction(fn)
}

// ValidateRequired 验证必需参数
func (s *BaseService) ValidateRequired(params map[string]string) error {
    for field, value := range params {
        if value == "" {
            return NewValidationError(field + " is required")
        }
    }
    return nil
}

// ValidationError 验证错误
type ValidationError struct {
    Message string
}

func (e *ValidationError) Error() string {
    return e.Message
}

// NewValidationError 创建验证错误
func NewValidationError(message string) *ValidationError {
    return &ValidationError{Message: message}
}
