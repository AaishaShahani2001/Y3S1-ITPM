package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"backend/initializers"
	"backend/models"
)

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

// Get all Treatment Plans
func GetTreatmentPlans(c *gin.Context) {
	type TreatmentPlanResponse struct {
		ID             uint   `json:"id"`
		AppointmentID  uint   `json:"appointment_id"`
		CounsellorID   uint   `json:"counsellor_id"`
		StudentID      uint   `json:"student_id"`
		Title          string `json:"title"`
		Description    string `json:"description"`
		Status         string `json:"status"`
		StudentName    string `json:"student_name"`
		CounsellorName string `json:"counsellor_name"`
	}

	var plans []TreatmentPlanResponse

	err := initializers.DB.Raw(`
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
		ORDER BY tp.id DESC
	`).Scan(&plans).Error

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