package handlers

import (
	"backend/services"
	"backend/utils"
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
func (h *ConfigHandler) GetAllConfigs(c *gin.Context) {
	configs, err := h.configService.GetAllConfigs()
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, configs)
}

// GetConfigByKey 根据key获取配置
func (h *ConfigHandler) GetConfigByKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		utils.Response.BadRequest(c, "key is required")
		return
	}

	config, err := h.configService.GetConfigByKey(key)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.Response.NotFound(c, "配置不存在")
			return
		}
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, config)
}

// CreateConfig 创建配置
func (h *ConfigHandler) CreateConfig(c *gin.Context) {
	var request struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}

	if err := utils.Binding.BindAndValidate(c, &request); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	config, err := h.configService.CreateConfig(request.Key, request.Value)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusCreated, config)
}

// UpdateConfig 更新配置
func (h *ConfigHandler) UpdateConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		utils.Response.BadRequest(c, "key is required")
		return
	}

	var request struct {
		Value string `json:"value" binding:"required"`
	}

	if err := utils.Binding.BindAndValidate(c, &request); err != nil {
		utils.Response.BadRequest(c, err.Error())
		return
	}

	config, err := h.configService.UpdateConfig(key, request.Value)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.Response.NotFound(c, "配置不存在")
			return
		}
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.Success(c, config)
}

// DeleteConfig 删除配置
func (h *ConfigHandler) DeleteConfig(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		utils.Response.BadRequest(c, "key is required")
		return
	}

	err := h.configService.DeleteConfig(key)
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.SuccessWithMessage(c, nil, "配置删除成功")
}

// InitConfigs 初始化配置
func (h *ConfigHandler) InitConfigs(c *gin.Context) {
	err := h.configService.InitDefaultConfigs()
	if err != nil {
		utils.Response.InternalServerError(c, err)
		return
	}

	utils.Response.SuccessWithMessage(c, nil, "配置初始化成功")
}
