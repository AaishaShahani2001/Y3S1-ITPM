package controllers

import (
	"backend/initializers"
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// =======================
// REQUEST STRUCT
// =======================
type RegisterInput struct {
	EventID    int    `json:"event_id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	University string `json:"university"`
	Faculty    string `json:"faculty"`
	Level      string `json:"level"`
	Degree     string `json:"degree"`
	Gender     string `json:"gender"`
}
// =======================
// REGISTER EVENT
// =======================
func RegisterEvent(c *gin.Context) {

	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// GET USER ID
	userIDValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint

	switch v := userIDValue.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	case int:
		userID = uint(v)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// CHECK DUPLICATE
	var existing models.Registration

	err := initializers.DB.
		Where("user_id = ? AND event_id = ?", userID, input.EventID).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You have already registered for this event",
		})
		return
	}


// GET EVENT
var event models.Event
initializers.DB.First(&event, input.EventID)

// COUNT CONFIRMED ONLY
var confirmedCount int64
initializers.DB.
	Model(&models.Registration{}).
	Where("event_id = ? AND status = ?", input.EventID, "confirmed").
	Count(&confirmedCount)

// DECIDE STATUS
status := "confirmed"
if int(confirmedCount) >= event.Capacity {
	status = "waitlist"
}

// ✅ CREATE REGISTRATION
reg := models.Registration{
	UserID:     userID,
	EventID:    uint(input.EventID),
	Name:       input.Name,
	Email:      input.Email,
	Phone:      input.Phone,
	University: input.University,
	Faculty:    input.Faculty,
	Level:      input.Level,
	Degree:     input.Degree,
	Gender:     input.Gender,
	Status:     status, 
}

	result := initializers.DB.Create(&reg)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Registration failed",
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

	initializers.DB.Find(&registrations)

	c.JSON(http.StatusOK, registrations)
}

// =======================
// GET REGISTRATIONS BY EVENT
// =======================
func GetRegistrationsByEvent(c *gin.Context) {

	id := c.Param("id")

	var registrations []models.Registration

	initializers.DB.Where("event_id = ?", id).Find(&registrations)

	c.JSON(http.StatusOK, registrations)
}

// =======================
// EVENT ANALYTICS
// =======================
func GetEventAnalytics(c *gin.Context) {

	id := c.Param("id")

	var registrations []models.Registration
	initializers.DB.Where("event_id = ?", id).Find(&registrations)

	total := len(registrations)

	confirmed := 0
	waitlist := 0
	male := 0
	female := 0

	for _, r := range registrations {

		if r.Status == "confirmed" {
			confirmed++

			if r.Gender == "Male" {
				male++
			} else if r.Gender == "Female" {
				female++
			}
		} else {
			waitlist++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total":  total,
		"waitlist": waitlist,
		"male":   male,
		"female": female,
		"data":   registrations,
	})
}

// =======================
// CREATE EVENT
// =======================
func CreateEvent(c *gin.Context) {

	title := c.PostForm("title")
	description := c.PostForm("description")
	date := c.PostForm("date")
	time := c.PostForm("time")
	location := c.PostForm("location")

	capacityStr := c.PostForm("capacity")
	capacity, _ := strconv.Atoi(capacityStr)

	file, err := c.FormFile("image")
	var imagePath string

	if err == nil {
		imagePath = "uploads/" + file.Filename
		c.SaveUploadedFile(file, imagePath)

	}

	



	event := models.Event{
		Title:       title,
		Description: description,
		Date:        date,
		Time:        time,
		Location:    location,
		Capacity:    capacity,
		Image:       imagePath,
	}

	initializers.DB.Create(&event)

	c.JSON(http.StatusOK, event)
}

// =======================
// GET EVENTS
// =======================
func GetEvents(c *gin.Context) {

	var events []models.Event
	initializers.DB.Find(&events)

	var result []gin.H

	for _, e := range events {

		var count int64

		// ✅ count registrations
		initializers.DB.
			Model(&models.Registration{}).
			Where("event_id = ?", e.ID).
			Count(&count)

		result = append(result, gin.H{
			"ID":         e.ID,
			"Title":      e.Title,
			"Description": e.Description,
			"Date":       e.Date,
			"Time":       e.Time,
			"Location":   e.Location,
			"Capacity":   e.Capacity,
			"Image":      e.Image,
			"Registered": count, 
		})
	}

	c.JSON(http.StatusOK, result)
}

// =======================
// DELETE EVENT 
// =======================
func DeleteEvent(c *gin.Context) {
	idParam := c.Param("id")

	id, _ := strconv.Atoi(idParam)

	println("Deleting event:", id)

	// ✅ DELETE RELATED REGISTRATIONS
	res := initializers.DB.
		Where("event_id = ?", uint(id)).
		Delete(&models.Registration{})

	println("Deleted registrations:", res.RowsAffected)

	// ✅ DELETE EVENT
	initializers.DB.Delete(&models.Event{}, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Event and registrations deleted successfully",
	})
}

// =======================
// UPDATE EVENT
// =======================
func UpdateEvent(c *gin.Context) {

	id := c.Param("id")

	var event models.Event
	initializers.DB.First(&event, id)

	if event.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	event.Title = c.PostForm("title")
	event.Description = c.PostForm("description")
	event.Date = c.PostForm("date")
	event.Time = c.PostForm("time")
	event.Location = c.PostForm("location")

	capacityStr := c.PostForm("capacity")
	capacity, _ := strconv.Atoi(capacityStr)
	event.Capacity = capacity

	initializers.DB.Save(&event)

	c.JSON(http.StatusOK, event)
}

// =======================
// GET EVENT BY ID
// =======================
func GetEventByID(c *gin.Context) {

	id := c.Param("id")

	var event models.Event
	initializers.DB.First(&event, id)

	if event.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	var count int64

	// ✅ count registrations
	initializers.DB.
		Model(&models.Registration{}).
		Where("event_id = ?", event.ID).
		Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"ID":         event.ID,
		"Title":      event.Title,
		"Description": event.Description,
		"Date":       event.Date,
		"Time":       event.Time,
		"Location":   event.Location,
		"Capacity":   event.Capacity,
		"Image":      event.Image,
		"Registered": count, 
	})
}


// =======================
// GET STUDENT EVENTS
// =======================
func GetStudentEvents(c *gin.Context) {

	userIDValue, exists := c.Get("userId")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	userID := uint(userIDValue.(float64))

	var registrations []models.Registration

	err := initializers.DB.
		Preload("Event").
		Where("user_id = ?", userID).
		Find(&registrations).Error

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// BUILD CUSTOM RESPONSE
	var response []gin.H

	for _, r := range registrations {
		response = append(response, gin.H{
			"id": r.ID, // ✅ registration ID
			"title": r.Event.Title,
			"date": r.Event.Date,
			"location": r.Event.Location,
			"image": r.Event.Image,
			"status": r.Status,
		})
	}

	c.JSON(200, response)
}
// =======================
// DELETE REGISTRATION
// =======================
func DeleteRegistration(c *gin.Context) {
	id := c.Param("id")

	userIDValue, _ := c.Get("userId")
	userID := uint(userIDValue.(float64))

	var reg models.Registration

	err := initializers.DB.
		Where("id = ? AND user_id = ?", id, userID).
		First(&reg).Error

	if err != nil {
		c.JSON(404, gin.H{"error": "Registration not found"})
		return
	}

	eventID := reg.EventID

	// ❌ DELETE CURRENT
	initializers.DB.Delete(&reg)

	//FIND FIRST WAITLIST
	var waitlist models.Registration
	err = initializers.DB.
		Where("event_id = ? AND status = ?", eventID, "waitlist").
		Order("created_at ASC").
		First(&waitlist).Error

	if err == nil {
		// PROMOTE
		waitlist.Status = "confirmed"
		initializers.DB.Save(&waitlist)
	}

	c.JSON(200, gin.H{"message": "Deleted and waitlist updated"})
}