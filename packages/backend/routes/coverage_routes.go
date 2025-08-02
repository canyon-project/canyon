package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

// SetupCoverageRoutes sets up coverage-related routes
func SetupCoverageRoutes(router *gin.Engine) {
	coverageHandler := handlers.NewCoverageHandler()

	api := router.Group("/api")
	{
		coverage := api.Group("/coverage")
		{
			// Coverage hit endpoints
			coverage.POST("/hit", coverageHandler.PostCoverageHit)
			coverage.POST("/hits/batch", coverageHandler.PostCoverageHitsBatch)
			
			// Coverage map endpoints
			coverage.POST("/map", coverageHandler.PostCoverageMap)
			coverage.GET("/map/:hash", coverageHandler.GetCoverageMap)
			
			// Coverage aggregation and query endpoints
			coverage.GET("/:coverage_id/aggregation", coverageHandler.GetCoverageAggregation)
			coverage.GET("/:coverage_id/hits", coverageHandler.GetCoverageHits)
		}
	}
}