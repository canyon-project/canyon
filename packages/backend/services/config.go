package services

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ConfigService 配置服务
type ConfigService struct {
	db *gorm.DB
}

// NewConfigService 创建配置服务
func NewConfigService() *ConfigService {
	return &ConfigService{
		db: db.GetDB(),
	}
}

// GetAllConfigs 获取所有配置
func (s *ConfigService) GetAllConfigs() ([]models.Config, error) {
	var configs []models.Config
	err := s.db.Find(&configs).Error
	return configs, err
}

// GetConfigByKey 根据key获取配置
func (s *ConfigService) GetConfigByKey(key string) (*models.Config, error) {
	var config models.Config
	err := s.db.Where("key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// CreateConfig 创建配置
func (s *ConfigService) CreateConfig(key, value string) (*models.Config, error) {
	config := &models.Config{
		ID:    uuid.New().String(),
		Key:   key,
		Value: value,
	}
	
	err := s.db.Create(config).Error
	if err != nil {
		return nil, err
	}
	
	return config, nil
}

// UpdateConfig 更新配置
func (s *ConfigService) UpdateConfig(key, value string) (*models.Config, error) {
	var config models.Config
	err := s.db.Where("key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	
	config.Value = value
	err = s.db.Save(&config).Error
	if err != nil {
		return nil, err
	}
	
	return &config, nil
}

// DeleteConfig 删除配置
func (s *ConfigService) DeleteConfig(key string) error {
	return s.db.Where("key = ?", key).Delete(&models.Config{}).Error
}

// LoadConfigFromFile 从文件加载配置到数据库
func (s *ConfigService) LoadConfigFromFile(filePath string) error {
	// 读取JSON文件
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	// 解析JSON数据
	var configs []map[string]interface{}
	err = json.Unmarshal(data, &configs)
	if err != nil {
		return fmt.Errorf("解析JSON数据失败: %v", err)
	}

	// 批量插入或更新配置
	for _, configData := range configs {
		key, ok := configData["key"].(string)
		if !ok {
			continue
		}
		
		value, ok := configData["value"]
		if !ok {
			continue
		}
		
		// 将value转换为字符串
		var valueStr string
		switch v := value.(type) {
		case string:
			valueStr = v
		case bool:
			valueStr = fmt.Sprintf("%t", v)
		case float64:
			valueStr = fmt.Sprintf("%.0f", v)
		default:
			valueStr = fmt.Sprintf("%v", v)
		}

		// 检查配置是否已存在
		var existingConfig models.Config
		err := s.db.Where("key = ?", key).First(&existingConfig).Error
		
		if err == gorm.ErrRecordNotFound {
			// 配置不存在，创建新配置
			_, err = s.CreateConfig(key, valueStr)
			if err != nil {
				log.Printf("创建配置失败 key=%s: %v", key, err)
			}
		} else if err == nil {
			// 配置存在，更新配置
			_, err = s.UpdateConfig(key, valueStr)
			if err != nil {
				log.Printf("更新配置失败 key=%s: %v", key, err)
			}
		} else {
			log.Printf("查询配置失败 key=%s: %v", key, err)
		}
	}

	return nil
}

// InitDefaultConfigs 初始化默认配置
func (s *ConfigService) InitDefaultConfigs() error {
	// 获取当前工作目录
	currentDir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("获取当前目录失败: %v", err)
	}

	// 构建配置文件路径
	configPath := filepath.Join(currentDir, "sql", "config.json")
	
	// 检查文件是否存在
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return fmt.Errorf("配置文件不存在: %s", configPath)
	}

	// 加载配置
	return s.LoadConfigFromFile(configPath)
}
