package middleware

import (
	"backend/utils"

	"github.com/gin-gonic/gin"
)

// RequestIDMiddleware 请求ID中间件
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从查询参数或头部获取RequestID，如果没有则生成新的
		requestID := c.Query("requestID")
		if requestID == "" {
			requestID = c.GetHeader("X-Request-ID")
		}
		if requestID == "" {
			requestID = utils.GenerateRequestID()
		}

		// 设置到上下文中
		c.Set("requestID", requestID)
		
		// 设置响应头
		c.Header("X-Request-ID", requestID)

		c.Next()
	}
}

// ValidationError 验证错误结构
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidateRequired 验证必需参数
func ValidateRequired(params map[string]string) []ValidationError {
	var errors []ValidationError
	
	for field, value := range params {
		if value == "" {
			errors = append(errors, ValidationError{
				Field:   field,
				Message: field + " is required",
			})
		}
	}
	
	return errors
}

// ValidateRequiredFields 验证必需字段中间件
func ValidateRequiredFields(fields ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		params := make(map[string]string)
		
		// 从查询参数和路径参数中获取值
		for _, field := range fields {
			value := c.Query(field)
			if value == "" {
				value = c.Param(field)
			}
			params[field] = value
		}
		
		// 验证必需参数
		if errors := ValidateRequired(params); len(errors) > 0 {
			utils.Response.BadRequest(c, "Missing required parameters: "+fields[0])
			c.Abort()
			return
		}
		
		c.Next()
	}
}