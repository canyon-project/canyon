package handlers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ConfigHandler 配置处理器
type ConfigHandler struct {
	configService *services.ConfigService
}

// NewConfigHandler 创建配置处理器
func NewConfigHandler(configService *services.ConfigService) *ConfigHandler {
	return &ConfigHandler{
		configService: configService,
	}
}

// GetAllConfigs 获取所有配置
// @Summary 获取所有配置
// @Description 获取系统中的所有配置项
// @Tags config
// @Accept json
// @Produce json
// @Success 200 {array} models.Config "配置列表"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config [get]
func (h *ConfigHandler) GetAllConfigs(c *gin.Context) {
	configs, err := h.configService.GetAllConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, configs)
}

// GetConfigByKey 根据key获取配置
// @Summary 根据key获取配置
// @Description 根据配置key获取对应的配置值
// @Tags config
// @Accept json
// @Produce json
// @Param key path string true "配置key" example(git_provider[0].id)
// @Success 200 {object} models.Config "配置信息"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 404 {object} map[string]interface{} "配置不存在"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config/{key} [get]
func (h *ConfigHandler) GetConfigByKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	config, err := h.configService.GetConfigByKey(key)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "配置不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, config)
}

// CreateConfig 创建配置
// @Summary 创建配置
// @Description 创建新的配置项
// @Tags config
// @Accept json
// @Produce json
// @Param config body map[string]string true "配置信息" example({"key":"test.key","value":"test.value"})
// @Success 201 {object} models.Config "创建的配置"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config [post]
func (h *ConfigHandler) CreateConfig(c *gin.Context) {
	var request struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.configService.CreateConfig(request.Key, request.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, config)
}

// UpdateConfig 更新配置
// @Summary 更新配置
// @Description 更新指定key的配置值
// @Tags config
// @Accept json
// @Produce json
// @Param key path string true "配置key" example(test.key)
// @Param config body map[string]string true "配置信息" example({"value":"new.value"})
// @Success 200 {object} models.Config "更新后的配置"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 404 {object} map[string]interface{} "配置不存在"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config/{key} [put]
func (h *ConfigHandler) UpdateConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var request struct {
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.configService.UpdateConfig(key, request.Value)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "配置不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, config)
}

// DeleteConfig 删除配置
// @Summary 删除配置
// @Description 删除指定key的配置项
// @Tags config
// @Accept json
// @Produce json
// @Param key path string true "配置key" example(test.key)
// @Success 200 {object} map[string]interface{} "删除成功"
// @Failure 400 {object} map[string]interface{} "请求参数错误"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config/{key} [delete]
func (h *ConfigHandler) DeleteConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	err := h.configService.DeleteConfig(key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "配置删除成功"})
}

// InitConfigs 初始化配置
// @Summary 初始化配置
// @Description 从配置文件加载默认配置到数据库
// @Tags config
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "初始化成功"
// @Failure 500 {object} map[string]interface{} "服务器内部错误"
// @Router /config/init [post]
func (h *ConfigHandler) InitConfigs(c *gin.Context) {
	err := h.configService.InitDefaultConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "配置初始化成功"})
}
