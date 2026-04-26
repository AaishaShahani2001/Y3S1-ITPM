package routes

import (
	"backend/controllers"
	"backend/middleware"
	"github.com/gin-gonic/gin"
)

func TreatmentPlanRoutes(r *gin.Engine) {
	r.POST("/api/treatment-plans", middleware.RequireAuth, controllers.CreateTreatmentPlan)
	r.GET("/api/treatment-plans", middleware.RequireAuth, controllers.GetTreatmentPlans)
	r.GET("/api/treatment-plans/student/:studentId", middleware.RequireAuth, controllers.GetTreatmentPlansByStudent)
	r.GET("/api/treatment-plans/:id", middleware.RequireAuth, controllers.GetTreatmentPlanByID)
	r.DELETE("/api/treatment-plans/:id", middleware.RequireAuth, controllers.DeleteTreatmentPlan)
	r.PUT("/api/treatment-plans/:id", middleware.RequireAuth, controllers.UpdateTreatmentPlan)
}