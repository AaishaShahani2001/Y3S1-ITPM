package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func MoodRoutes(router *gin.Engine) {

	mood := router.Group("/api/mood")
	{
		mood.POST("/analyze", controllers.AnalyzeMoodDetails)
	}

}
