package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse 统一的API响应结构
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// ResponseHelper 响应助手
type ResponseHelper struct{}

// NewResponseHelper 创建响应助手
func NewResponseHelper() *ResponseHelper {
	return &ResponseHelper{}
}

// Success 成功响应
func (r *ResponseHelper) Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMessage 带消息的成功响应
func (r *ResponseHelper) SuccessWithMessage(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// Error 错误响应
func (r *ResponseHelper) Error(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   err.Error(),
	})
}

// ErrorWithMessage 带自定义消息的错误响应
func (r *ResponseHelper) ErrorWithMessage(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   message,
	})
}

// BadRequest 400错误响应
func (r *ResponseHelper) BadRequest(c *gin.Context, message string) {
	r.ErrorWithMessage(c, http.StatusBadRequest, message)
}

// InternalServerError 500错误响应
func (r *ResponseHelper) InternalServerError(c *gin.Context, err error) {
	r.Error(c, http.StatusInternalServerError, err)
}

// NotFound 404错误响应
func (r *ResponseHelper) NotFound(c *gin.Context, message string) {
	r.ErrorWithMessage(c, http.StatusNotFound, message)
}

// 全局响应助手实例
var Response = NewResponseHelper()