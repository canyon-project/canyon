package handlers

import (
	"backend/db"
	"net/http"
	"github.com/gin-gonic/gin"
)

type ConfigHandler struct{}

type ConfigRequest struct {
	Key   string `json:"key" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type ConfigResponse struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func NewConfigHandler() *ConfigHandler {
	return &ConfigHandler{}
}

// GetConfig 获取配置
func (h *ConfigHandler) GetConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Config key is required",
		})
		return
	}

	value, err := db.GetConfig(key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Config not found",
		})
		return
	}

	c.JSON(http.StatusOK, ConfigResponse{
		Key:   key,
		Value: value,
	})
}

// SetConfig 设置配置
func (h *ConfigHandler) SetConfig(c *gin.Context) {
	var request ConfigRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	err := db.SetConfig(request.Key, request.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to set config: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Config updated successfully",
		"key":     request.Key,
	})
}

// ListConfigs 列出所有配置
func (h *ConfigHandler) ListConfigs(c *gin.Context) {
	var configs []ConfigResponse
	
	// 获取所有配置键
	configKeys := []string{
		"GITHUB_CLIENT_ID",
		"GITHUB_CLIENT_SECRET", 
		"GITHUB_REDIRECT_URL",
		"JWT_SECRET",
	}

	for _, key := range configKeys {
		value, err := db.GetConfig(key)
		if err == nil {
			// 对敏感信息进行脱敏处理
			if key == "GITHUB_CLIENT_SECRET" || key == "JWT_SECRET" {
				if len(value) > 8 {
					value = value[:4] + "****" + value[len(value)-4:]
				} else {
					value = "****"
				}
			}
			configs = append(configs, ConfigResponse{
				Key:   key,
				Value: value,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"configs": configs,
	})
}