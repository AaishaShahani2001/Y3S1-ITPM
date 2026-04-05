package controllers

import (
	"net/http"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
	"backend/initializers"
	"backend/models"
)

type treatmentPlanListResponse struct {
	ID             uint      `json:"id"`
	AppointmentID  uint      `json:"appointment_id"`
	CounsellorID   uint      `json:"counsellor_id"`
	StudentID      uint      `json:"student_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Status         string    `json:"status"`
	StudentName    string    `json:"student_name"`
	CounsellorName string    `json:"counsellor_name"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Create Treatment Plan
func CreateTreatmentPlan(c *gin.Context) {
	var plan models.TreatmentPlan

	if err := c.BindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	result := initializers.DB.Create(&plan)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// GetTreatmentPlans returns treatment plans for the logged-in counselor.
// Admins receive all plans; counselors only their own; students are not allowed.
func GetTreatmentPlans(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if currentUser.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	baseSQL := `
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name,
			tp.updated_at
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
	`

	var plans []treatmentPlanListResponse
	var err error

	switch currentUser.Role {
	case "admin":
		err = initializers.DB.Raw(baseSQL + ` ORDER BY tp.id DESC`).Scan(&plans).Error
	case "counselor":
		err = initializers.DB.Raw(baseSQL+` WHERE tp.counsellor_id = ? ORDER BY tp.id DESC`, currentUser.ID).Scan(&plans).Error
	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch treatment plans"})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// GetTreatmentPlansByStudent returns plans for one student. Students may only access their own;
// counselors and admins may access any student.
func GetTreatmentPlansByStudent(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentIDStr := c.Param("studentId")
	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil || studentID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	if currentUser.Role == "student" && currentUser.ID != uint(studentID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var plans []treatmentPlanListResponse

	err = initializers.DB.Raw(`
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name,
			tp.updated_at
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
		WHERE tp.student_id = ?
		ORDER BY tp.id DESC
	`, uint(studentID)).Scan(&plans).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch treatment plans"})
		return
	}

	c.JSON(http.StatusOK, plans)
}

func DeleteTreatmentPlan(c *gin.Context) {
	id := c.Param("id")

	result := initializers.DB.Delete(&models.TreatmentPlan{}, id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Treatment plan deleted successfully"})
}

func UpdateTreatmentPlan(c *gin.Context) {
	id := c.Param("id")

	var existingPlan models.TreatmentPlan
	if err := initializers.DB.First(&existingPlan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Treatment plan not found"})
		return
	}

	var updatedData models.TreatmentPlan
	if err := c.BindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	existingPlan.AppointmentID = updatedData.AppointmentID
	existingPlan.CounsellorID = updatedData.CounsellorID
	existingPlan.StudentID = updatedData.StudentID
	existingPlan.Title = updatedData.Title
	existingPlan.Description = updatedData.Description
	existingPlan.Status = updatedData.Status

	if err := initializers.DB.Save(&existingPlan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update treatment plan"})
		return
	}

	c.JSON(http.StatusOK, existingPlan)
}