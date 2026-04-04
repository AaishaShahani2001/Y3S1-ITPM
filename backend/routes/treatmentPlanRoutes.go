package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func TreatmentPlanRoutes(r *gin.Engine) {
	r.POST("/api/treatment-plans", controllers.CreateTreatmentPlan)
	r.GET("/api/treatment-plans", controllers.GetTreatmentPlans)
	r.DELETE("/api/treatment-plans/:id", controllers.DeleteTreatmentPlan)
	r.PUT("/api/treatment-plans/:id", controllers.UpdateTreatmentPlan)
}