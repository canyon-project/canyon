package handlers

import (
	"backend/config"
	"backend/services"
	"backend/utils"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// GitHubLogin 开始GitHub OAuth流程
func (h *AuthHandler) GitHubLogin(c *gin.Context) {
	// 生成随机state参数防止CSRF攻击
	state := generateRandomState()

	// 将state存储在session中（这里简化处理，实际应用中应该使用更安全的方式）
	c.SetCookie("oauth_state", state, 600, "/", "", false, true)

	url := config.GitHubOAuthConfig.AuthCodeURL(state)
	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})
}

// GitHubCallback 处理前端传来的GitHub授权码
func (h *AuthHandler) GitHubCallback(c *gin.Context) {
	var request struct {
		Code  string `json:"code" binding:"required"`
		State string `json:"state" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	// 交换code获取access token
	token, err := config.GitHubOAuthConfig.Exchange(c.Request.Context(), request.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to exchange token: " + err.Error(),
		})
		return
	}

	// 获取或创建用户
	user, err := h.authService.GetOrCreateUser(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get user info: " + err.Error(),
		})
		return
	}

	// 生成JWT token
	jwtToken, err := h.authService.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate JWT: " + err.Error(),
		})
		return
	}

	// 返回token和用户信息
	c.JSON(http.StatusOK, LoginResponse{
		Token: jwtToken,
		User:  user,
	})
}

// GetProfile 获取当前用户信息
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	user, err := h.authService.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// AuthMiddleware JWT认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// 检查Bearer token格式
		tokenParts := strings.SplitN(authHeader, " ", 2)
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		// 解析JWT token
		claims, err := utils.ParseToken(tokenParts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token: " + err.Error(),
			})
			c.Abort()
			return
		}

		// 将用户信息存储到context中
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

// generateRandomState 生成随机state字符串
func generateRandomState() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
