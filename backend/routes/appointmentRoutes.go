package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AppointmentRoutes(router *gin.Engine) {

	appointment := router.Group("/api/appointments")
	{
		appointment.POST("/create", middleware.RequireAuth, controllers.CreateAppointment)
		appointment.GET("/booked-slots", controllers.GetBookedSlots)
		appointment.GET("/counselor", middleware.RequireAuth, controllers.GetCounselorAppointments)
		appointment.GET("/student", middleware.RequireAuth, controllers.GetStudentAppointments)
		appointment.PUT("/:id/student", middleware.RequireAuth, controllers.UpdateAppointmentForStudent)
		appointment.DELETE("/:id/student", middleware.RequireAuth, controllers.DeleteAppointmentForStudent)
		appointment.PUT("/:id/cancellation/approve", middleware.RequireAuth, controllers.ApproveCancellationForCounselor)
		appointment.PUT("/:id/counselor-cancel", middleware.RequireAuth, controllers.CancelAppointmentByCounselor)
		appointment.PUT("/:id/status", middleware.RequireAuth, controllers.UpdateAppointmentStatusForCounselor)
	}

}
