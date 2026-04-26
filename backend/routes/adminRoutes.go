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

	admin.GET("/appointments", controllers.GetAllAppointmentsForAdmin)

	admin.PUT("/applications/:id/approve", controllers.ApproveCounsellor)

	admin.PUT("/applications/:id/reject", controllers.RejectCounsellor)

	// Admin schedules/updates viva interview date, mode, and note.
	admin.PUT("/applications/:id/interview", controllers.ScheduleCounsellorInterview)
	admin.PUT("/applications/:id/interview/complete", controllers.CompleteCounsellorInterview)
	admin.PUT("/applications/:id/interview/cancel", controllers.CancelCounsellorInterview)

}
