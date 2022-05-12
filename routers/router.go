package routers

import (
	"canyon/routers/api/v1"
	"github.com/gin-gonic/gin"
)

// InitRouter initialize routing information
func InitRouter() *gin.Engine {
	r := gin.New()
	apiv1 := r.Group("/api/v1")
	{
		//获取标签列表
		apiv1.GET("/tags", v1.GetTags)

		//获取报表自定义配置列表
		apiv1.GET("/CustomConfigs", v1.GetCustomConfigs)
	}

	return r
}
