package controllers

import (
	"backend/initializers"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET ALL COUNSELLOR APPLICATIONS
func GetCounsellorApplications(c *gin.Context) {

	var applications []models.CounsellorApplication

	initializers.DB.Order("created_at desc").Find(&applications)

	c.JSON(http.StatusOK, applications)
}

// APPROVE COUNSELLOR
func ApproveCounsellor(c *gin.Context) {

	id := c.Param("id")

	var application models.CounsellorApplication

	initializers.DB.First(&application, id)

	if application.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// update status
	application.Status = "approved"

	initializers.DB.Save(&application)

	// update user role
	var user models.User
	initializers.DB.First(&user, application.UserId)

	user.Role = "counselor"

	initializers.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message": "Counsellor approved successfully",
	})
}

// REJECT COUNSELLOR
func RejectCounsellor(c *gin.Context) {

	id := c.Param("id")

	var application models.CounsellorApplication

	initializers.DB.First(&application, id)

	if application.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	application.Status = "rejected"

	initializers.DB.Save(&application)

	c.JSON(http.StatusOK, gin.H{
		"message": "Application rejected",
	})
}

// adminAppointmentRow is used for admin-wide appointment listing (read-only).
type adminAppointmentRow struct {
	models.Appointment
	StudentName   string `json:"studentName" gorm:"column:student_display_name"`
	CounselorName string `json:"counselorName" gorm:"column:counselor_display_name"`
}

// GetAllAppointmentsForAdmin returns all appointments with student/counselor names (admin only).
func GetAllAppointmentsForAdmin(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	var appointments []adminAppointmentRow
	err := initializers.DB.
		Table("appointments").
		Select(`
			appointments.*,
			COALESCE(NULLIF(su.name, ''), NULLIF(appointments.student_name, ''), 'Unknown Student') AS student_display_name,
			COALESCE(NULLIF(cu.name, ''), NULLIF(ca.full_name, ''), 'Counselor') AS counselor_display_name
		`).
		Joins("LEFT JOIN users AS su ON su.id = appointments.student_id").
		Joins("LEFT JOIN users AS cu ON cu.id = appointments.counsellor_id").
		Joins(`LEFT JOIN counsellor_applications ca ON ca.user_id = appointments.counsellor_id AND ca.status = 'approved'`).
		Order("appointments.date DESC, appointments.time_slot DESC").
		Scan(&appointments).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}
	if appointments == nil {
		appointments = []adminAppointmentRow{}
	}
	c.JSON(http.StatusOK, appointments)
}
