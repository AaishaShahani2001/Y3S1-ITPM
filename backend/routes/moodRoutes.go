package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func MoodRoutes(router *gin.Engine) {

	mood := router.Group("/api/mood")
	{
		mood.POST("/analyze", controllers.AnalyzeMoodDetails)
		mood.GET("/tracker", middleware.RequireAuth, controllers.GetMoodTrackerRecords)
		mood.POST("/tracker", middleware.RequireAuth, controllers.UpsertMoodTrackerRecord)
		mood.DELETE("/tracker", middleware.RequireAuth, controllers.DeleteMoodTrackerRecordByDate)
		mood.PUT("/tracker/:id", middleware.RequireAuth, controllers.UpdateMoodTrackerRecord)
		mood.DELETE("/tracker/:id", middleware.RequireAuth, controllers.DeleteMoodTrackerRecord)
	}

}
