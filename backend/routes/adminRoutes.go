package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(r *gin.Engine) {

	admin := r.Group("/api/admin")

	admin.Use(middleware.RequireAuth)

	admin.GET("/applications", controllers.GetCounsellorApplications)

	admin.PUT("/applications/:id/approve", controllers.ApproveCounsellor)

	admin.PUT("/applications/:id/reject", controllers.RejectCounsellor)

}
