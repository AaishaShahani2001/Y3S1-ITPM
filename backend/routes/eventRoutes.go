package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func EventRoutes(r *gin.Engine) {

	r.POST("/api/events/register", controllers.RegisterEvent)
	r.GET("/api/events/registrations", controllers.GetRegistrations)

}