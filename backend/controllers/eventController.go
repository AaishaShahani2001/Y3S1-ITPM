package controllers

import (
	"backend/initializers"
	"backend/models"   // ✅ IMPORTANT
	"net/http"

	"github.com/gin-gonic/gin"
)

// =======================
// STRUCT (Request Body)
// =======================
type EventRegistration struct {
	EventID    int    `json:"event_id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	University string `json:"university"`
	Faculty    string `json:"faculty"`
	Level      string `json:"level"`
	Degree     string `json:"degree"`
}

// =======================
// REGISTER EVENT
// =======================
func RegisterEvent(c *gin.Context) {

	var input EventRegistration

	// Bind JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	// ✅ Use GORM Create (NOT Exec)
	registration := models.Registration{
		EventID:    input.EventID,
		Name:       input.Name,
		Email:      input.Email,
		Phone:      input.Phone,
		University: input.University,
		Faculty:    input.Faculty,
		Level:      input.Level,
		Degree:     input.Degree,
	}

	result := initializers.DB.Create(&registration)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event registration successful",
	})
}

// =======================
// GET ALL REGISTRATIONS
// =======================
func GetRegistrations(c *gin.Context) {

	var registrations []models.Registration

	result := initializers.DB.Find(&registrations)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch registrations",
		})
		return
	}

	c.JSON(http.StatusOK, registrations)
}