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
