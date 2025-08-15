package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// ErrorHandler 错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// log detailed error and stack
				log.Printf("[PANIC] %v", err)
				if c.Request != nil {
					log.Printf("[REQUEST] %s %s", c.Request.Method, c.Request.URL.String())
					log.Printf("[CLIENT] ip=%s ua=%s", c.ClientIP(), c.Request.UserAgent())
				}
				log.Printf("[STACK]\n%s", string(debug.Stack()))
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal Server Error",
					"message": "服务器内部错误",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
