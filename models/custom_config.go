package models

import "github.com/jinzhu/gorm"

// 自定义表名
func (CustomConfig) TableName() string {
	return "idev_chart_custom_config"
}

type CustomConfig struct {
	Model

	Name string `json:"name"`
}

// GetTags gets a list of tags based on paging and constraints
func GetCustomConfigs(pageNum int, pageSize int, maps interface{}) ([]CustomConfig, error) {
	var (
		customConfigs []CustomConfig
		err           error
	)

	if pageSize > 0 && pageNum > 0 {
		err = db.Where(maps).Find(&customConfigs).Offset(pageNum).Limit(pageSize).Error
	} else {
		err = db.Where(maps).Find(&customConfigs).Error
	}

	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	return customConfigs, nil
}

// GetTagTotal counts the total number of tags based on the constraint
func GetCustomConfigTotal(maps interface{}) (int, error) {
	var count int
	if err := db.Model(&CustomConfig{}).Where(maps).Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}
