package controllers

import (
	"backend/initializers"
	"backend/models"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ========================= ADD SLOT ==========================//
func AddAvailability(c *gin.Context) {

	var slot models.CounsellorAvailability

	// Bind request
	if err := c.ShouldBindJSON(&slot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// 1. CHECK DISTINCT DATE COUNT
	var dateCount int64

	initializers.DB.
		Model(&models.CounsellorAvailability{}).
		Where("counsellor_id = ?", slot.CounsellorID).
		Distinct("date").
		Count(&dateCount)

	// Check if this date already exists
	var existingDate models.CounsellorAvailability

	errDate := initializers.DB.
		Where("counsellor_id = ? AND date = ?", slot.CounsellorID, slot.Date).
		First(&existingDate).Error

	// Only treat as NEW date if record not found
	isNewDate := errors.Is(errDate, gorm.ErrRecordNotFound)

	if isNewDate && dateCount >= 4 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You can only add availability for 4 different dates",
		})
		return
	}

	// 2. LIMIT: Max 4 slots per DATE
	var count int64

	initializers.DB.
		Model(&models.CounsellorAvailability{}).
		Where("counsellor_id = ? AND date = ?", slot.CounsellorID, slot.Date).
		Count(&count)

	if count >= 4 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Max 4 slots allowed per day",
		})
		return
	}

	// 3. OVERLAP CHECK
	var existing models.CounsellorAvailability

	err := initializers.DB.
		Where(`
			counsellor_id = ? AND date = ? AND 
			(start_time < ? AND end_time > ?)
		`,
			slot.CounsellorID,
			slot.Date,
			slot.EndTime,
			slot.StartTime,
		).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Time slot overlaps with existing slot",
		})
		return
	}

	// 4. OPTIONAL VALIDATION
	if slot.StartTime >= slot.EndTime {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Start time must be before end time",
		})
		return
	}

	// 5. CREATE SLOT
	slot.Status = "available"

	initializers.DB.Create(&slot)

	c.JSON(http.StatusOK, slot)
}

// ========================= GET all slots for a counsellor ========================//
func GetAvailability(c *gin.Context) {

	counsellorIdParam := c.Param("id")
	fmt.Println("[DEBUG] GetAvailability - counsellorId param:", counsellorIdParam)

	// Convert string ID to uint
	var counsellorId uint
	if _, err := fmt.Sscanf(counsellorIdParam, "%d", &counsellorId); err != nil {
		fmt.Println("[ERROR] Failed to parse counsellor ID:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor ID format"})
		return
	}

	fmt.Println("[DEBUG] Converted counsellorId to:", counsellorId)

	var slots []models.CounsellorAvailability

	err := initializers.DB.
		Where("counsellor_id = ?", counsellorId).
		Find(&slots).Error

	fmt.Println("[DEBUG] Query result - slots count:", len(slots), "error:", err)

	if err != nil {
		fmt.Println("[ERROR] Database query error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch availability"})
		return
	}

	// Return empty array instead of null
	if slots == nil {
		slots = []models.CounsellorAvailability{}
	}

	fmt.Println("[DEBUG] Returning slots:", slots)
	c.JSON(http.StatusOK, slots)
}

// ====================== UPDATE SLOT =============================//
func UpdateAvailability(c *gin.Context) {

	// Convert ID to uint
	idParam := c.Param("id")

	var slot models.CounsellorAvailability

	// find slot safely
	if err := initializers.DB.First(&slot, idParam).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Slot not found",
		})
		return
	}

	// request body
	var input struct {
		Date      string `json:"date"`
		StartTime string `json:"startTime"`
		EndTime   string `json:"endTime"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid data",
		})
		return
	}

	//  Validate time
	if input.StartTime >= input.EndTime {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Start time must be before end time",
		})
		return
	}

	// OVERLAP CHECK (exclude self)
	var existing models.CounsellorAvailability

	err := initializers.DB.
		Where(`
			counsellor_id = ? AND date = ? AND id != ? AND
			(start_time < ? AND end_time > ?)
		`,
			slot.CounsellorID,
			input.Date,
			slot.ID,
			input.EndTime,
			input.StartTime,
		).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Time slot overlaps with another slot",
		})
		return
	}

	// UPDATE AFTER VALIDATION
	slot.Date = input.Date
	slot.StartTime = input.StartTime
	slot.EndTime = input.EndTime

	initializers.DB.Save(&slot)

	c.JSON(http.StatusOK, slot)
}

// =========== DELETE SLOT ====================================//
func DeleteAvailability(c *gin.Context) {

	id := c.Param("id")

	var slot models.CounsellorAvailability

	// check if exists
	if err := initializers.DB.First(&slot, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Slot not found",
		})
		return
	}

	// delete exact record
	initializers.DB.Delete(&slot)
	fmt.Println("Deleting ID:", id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Slot removed successfully",
	})
}
