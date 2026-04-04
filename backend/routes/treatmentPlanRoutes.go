package routes

import (
	"backend/controllers"
	"backend/middleware"
	"github.com/gin-gonic/gin"
)

func TreatmentPlanRoutes(r *gin.Engine) {
	r.POST("/api/treatment-plans", controllers.CreateTreatmentPlan)
	r.GET("/api/treatment-plans", controllers.GetTreatmentPlans)
	r.GET("/api/treatment-plans/student/:studentId", middleware.RequireAuth, controllers.GetTreatmentPlansByStudent)
	r.DELETE("/api/treatment-plans/:id", controllers.DeleteTreatmentPlan)
	r.PUT("/api/treatment-plans/:id", controllers.UpdateTreatmentPlan)
}