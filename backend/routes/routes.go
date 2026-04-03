package routes

import (
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	AuthRoutes(r)
	CounsellorRoutes(r)
	AdminRoutes(r)
	AvailabilityRoutes(r)
	AppointmentRoutes(r)
	MoodRoutes(r)
}
