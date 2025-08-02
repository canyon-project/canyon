package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORS 跨域中间件 - 允许所有域
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 允许所有域
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}