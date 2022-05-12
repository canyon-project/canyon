package custom_config_service

import "canyon/models"

type CustomConfig struct {
	Name string
}

func (t *CustomConfig) GetAll() ([]models.CustomConfig, error) {
	return models.GetCustomConfigs(1, 2, t.getMaps())
}

func (t *CustomConfig) getMaps() map[string]interface{} {
	maps := make(map[string]interface{})
	//maps["deleted_on"] = 0

	if t.Name != "" {
		maps["name"] = t.Name
	}

	return maps
}

func (t *CustomConfig) Count() (int, error) {
	return models.GetCustomConfigTotal(t.getMaps())
}
