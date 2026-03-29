package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {

	r.POST("/api/signup", controllers.Signup)
	r.POST("/api/login", controllers.Login)

	r.GET("/api/validate", middleware.RequireAuth, controllers.Validate)

}
