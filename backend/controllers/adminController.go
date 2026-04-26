package controllers

import (
	"backend/initializers"
	"backend/models"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GET ALL COUNSELLOR APPLICATIONS
func GetCounsellorApplications(c *gin.Context) {

	var applications []models.CounsellorApplication

	initializers.DB.Order("created_at desc").Find(&applications)

	c.JSON(http.StatusOK, applications)
}

// ScheduleCounsellorInterview sets/updates viva-interview details for an application.
func ScheduleCounsellorInterview(c *gin.Context) {
	// Application id from admin route: /api/admin/applications/:id/interview
	id := c.Param("id")

	var application models.CounsellorApplication
	if err := initializers.DB.First(&application, id).Error; err != nil || application.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	var input struct {
		// Frontend sends datetime-local / ISO value.
		InterviewDate string `json:"interviewDate"`
		// Enforced to online/onsite so UI has predictable options.
		InterviewMode string `json:"interviewMode"`
		// Optional note shown in pending counselor timeline page.
		InterviewNote string `json:"interviewNote"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Accept RFC3339 first (API-friendly format).
	parsedDate, err := time.Parse(time.RFC3339, strings.TrimSpace(input.InterviewDate))
	if err != nil {
		// Fallback for HTML datetime-local format: "2006-01-02T15:04"
		parsedDate, err = time.Parse("2006-01-02T15:04", strings.TrimSpace(input.InterviewDate))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid interview date format"})
			return
		}
	}

	// Normalize mode to lowercase before validation/persistence.
	mode := strings.ToLower(strings.TrimSpace(input.InterviewMode))
	if mode != "online" && mode != "onsite" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Interview mode must be online or onsite"})
		return
	}

	application.InterviewDate = &parsedDate
	application.InterviewMode = mode
	application.InterviewNote = strings.TrimSpace(input.InterviewNote)
	// Scheduling immediately marks interview status as "scheduled".
	application.InterviewStatus = "scheduled"

	if err := initializers.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule interview"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Interview scheduled successfully",
		"data":    application,
	})
}

// CompleteCounsellorInterview marks an already scheduled viva as completed.
func CompleteCounsellorInterview(c *gin.Context) {
	id := c.Param("id")

	var application models.CounsellorApplication
	if err := initializers.DB.First(&application, id).Error; err != nil || application.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	if application.InterviewDate == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Interview must be scheduled before completion"})
		return
	}

	application.InterviewStatus = "completed"
	if err := initializers.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete interview"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Interview marked as completed",
		"data":    application,
	})
}

// CancelCounsellorInterview marks a scheduled/completed interview as cancelled.
func CancelCounsellorInterview(c *gin.Context) {
	id := c.Param("id")

	var application models.CounsellorApplication
	if err := initializers.DB.First(&application, id).Error; err != nil || application.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	if application.InterviewDate == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Interview is not scheduled"})
		return
	}

	application.InterviewStatus = "cancelled"
	if err := initializers.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel interview"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Interview cancelled",
		"data":    application,
	})
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
