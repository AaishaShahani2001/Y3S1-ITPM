package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	r.POST("/api/signup", controllers.Signup)
	r.POST("/api/login", controllers.Login)

	// Protected route example
	r.GET("/api/validate", middleware.RequireAuth, controllers.Validate)
}
