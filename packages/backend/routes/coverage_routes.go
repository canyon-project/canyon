package routes

import (
	"backend/handlers"
	"backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupCoverageRoutes sets up coverage-related routes
func SetupCoverageRoutes(router *gin.Engine, db *gorm.DB) {
	clickhouseCoverageHandler := handlers.NewClickHouseCoverageHandler()
	coverageFinalService := services.NewCoverageFinalService()
	coverageFinalHandler := handlers.NewCoverageFinalHandler(coverageFinalService)

	api := router.Group("/api")
	{
		coverage := api.Group("/coverage")
		{
			// Coverage hit endpoints
			coverage.POST("/hit", clickhouseCoverageHandler.PostCoverageHit)
			coverage.POST("/hits/batch", clickhouseCoverageHandler.PostCoverageHitsBatch)
			
			// Coverage map endpoints
			coverage.POST("/map", clickhouseCoverageHandler.PostCoverageMap)
			coverage.GET("/map/:hash", clickhouseCoverageHandler.GetCoverageMap)
			
			// Coverage aggregation and query endpoints
			coverage.GET("/:coverage_id/aggregation", clickhouseCoverageHandler.GetCoverageAggregation)
			coverage.GET("/:coverage_id/hits", clickhouseCoverageHandler.GetCoverageHits)
		}

		// Coverage final endpoints (v1 API)
		v1 := api.Group("/v1")
		{
			coverageV1 := v1.Group("/coverage")
			{
				coverageV1.GET("/summary/map", coverageFinalHandler.GetCoverageSummaryMap)
				coverageV1.GET("/map", coverageFinalHandler.GetCoverageMap)
			}
		}
	}
}