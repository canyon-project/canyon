package v1

import (
	"canyon/pkg/app"
	"canyon/pkg/e"
	"canyon/service/custom_config_service"
	"net/http"

	//"canyon/service/tag_service"
	"github.com/gin-gonic/gin"
)

func GetCustomConfigs(c *gin.Context) {
	appG := app.Gin{C: c}

	customConfigService := custom_config_service.CustomConfig{
		Name: "",
	}

	customConfigs, err := customConfigService.GetAll()
	if err != nil {
		appG.Response(http.StatusInternalServerError, e.ERROR_GET_TAGS_FAIL, nil)
		return
	}

	count, err := customConfigService.Count()
	if err != nil {
		appG.Response(http.StatusInternalServerError, e.ERROR_COUNT_TAG_FAIL, nil)
		return
	}

	appG.Response(http.StatusOK, e.SUCCESS, map[string]interface{}{
		"lists": customConfigs,
		"total": count,
	})
}
