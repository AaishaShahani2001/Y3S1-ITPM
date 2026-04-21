package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func EventRoutes(r *gin.Engine) {

	// 🔥 PROTECTED ROUTES (JWT REQUIRED)
	auth := r.Group("/api")
	auth.Use(middleware.RequireAuth)

	auth.POST("/events/register", controllers.RegisterEvent)
	auth.GET("/student/events", controllers.GetStudentEvents)
	auth.DELETE("/registration/:id", controllers.DeleteRegistration)
	auth.POST("/events/scan", controllers.ScanAttendance)
	

	// 🔥 PUBLIC ROUTES
	r.GET("/api/events/registrations", controllers.GetRegistrations)
	r.POST("/api/events", controllers.CreateEvent)
	r.GET("/api/events", controllers.GetEvents)
	r.PUT("/api/events/:id", controllers.UpdateEvent)
	r.DELETE("/api/events/:id", controllers.DeleteEvent)
	r.GET("/api/events/:id", controllers.GetEventByID)
	r.GET("/api/events/:id/registrations", controllers.GetRegistrationsByEvent)
	r.GET("/api/events/:id/analytics", controllers.GetEventAnalytics)
}