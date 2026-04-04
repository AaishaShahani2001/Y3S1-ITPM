package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func AvailabilityRoutes(r *gin.Engine) {

	r.GET("/api/counsellor/availability/:id", controllers.GetAvailability)
	r.POST("/api/counsellor/availability", controllers.AddAvailability)
	r.PUT("/api/counsellor/availability/:id", controllers.UpdateAvailability)
	r.DELETE("/api/counsellor/availability/:id", controllers.DeleteAvailability)
}
