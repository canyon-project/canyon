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

// Success 成功响应：直接返回原始数据（不再包裹 data）
func (r *ResponseHelper) Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, data)
}

// SuccessWithMessage 保留以兼容，但直接返回数据
func (r *ResponseHelper) SuccessWithMessage(c *gin.Context, data interface{}, _ string) {
	c.JSON(http.StatusOK, data)
}

// Error 错误响应：返回纯文本消息，不再包裹
func (r *ResponseHelper) Error(c *gin.Context, statusCode int, err error) {
	c.String(statusCode, err.Error())
	c.Abort()
}

// ErrorWithMessage 带自定义消息的错误响应：返回纯文本
func (r *ResponseHelper) ErrorWithMessage(c *gin.Context, statusCode int, message string) {
	c.String(statusCode, message)
	c.Abort()
}

// BadRequest 400错误响应
func (r *ResponseHelper) BadRequest(c *gin.Context, message string) {
	r.ErrorWithMessage(c, http.StatusBadRequest, message)
}

// InternalServerError 500错误响应：直接抛出异常，由中间件统一处理
func (r *ResponseHelper) InternalServerError(_ *gin.Context, err error) {
	panic(err)
}

// NotFound 404错误响应
func (r *ResponseHelper) NotFound(c *gin.Context, message string) {
	r.ErrorWithMessage(c, http.StatusNotFound, message)
}

// 全局响应助手实例
var Response = NewResponseHelper()
