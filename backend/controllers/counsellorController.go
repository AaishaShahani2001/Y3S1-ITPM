package controllers

import (
	"backend/initializers"
	"backend/models"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

//================ SADHUSHAN'S CONTROLLERS ================//

// APPLY TO BE A COUNSELLOR
func ApplyCounsellor(c *gin.Context) {

	// -------- READ NORMAL FORM FIELDS --------

	userIdStr := c.PostForm("userId")
	fullName := c.PostForm("fullName")
	email := c.PostForm("email")
	phone := c.PostForm("phone")
	specialization := c.PostForm("specialization")
	qualification := c.PostForm("qualification")
	workplace := c.PostForm("workplace")
	about := c.PostForm("about")
	registrationId := c.PostForm("registrationId")
	experienceStr := c.PostForm("experience")

	userId, _ := strconv.Atoi(userIdStr)
	experience, _ := strconv.Atoi(experienceStr)

	// -------- HANDLE NIC FILE --------

	nicFile, err := c.FormFile("nicFile")

	var nicPath string

	if err == nil {

		os.MkdirAll("./uploads/nic", os.ModePerm)

		nicPath = filepath.Join("uploads/nic", nicFile.Filename)

		c.SaveUploadedFile(nicFile, nicPath)
	}

	// -------- HANDLE CERTIFICATES --------

	form, _ := c.MultipartForm()
	files := form.File["certFiles"]

	var certPath string

	if len(files) > 0 {

		os.MkdirAll("./uploads/certificates", os.ModePerm)

		for _, file := range files {

			path := filepath.Join("uploads/certificates", file.Filename)

			c.SaveUploadedFile(file, path)

			certPath = path
		}
	}

	// -------- SAVE TO DATABASE --------

	application := models.CounsellorApplication{
		UserId:          uint(userId),
		FullName:        fullName,
		Email:           email,
		Phone:           phone,
		Specialization:  specialization,
		Qualification:   qualification,
		Experience:      experience,
		Workplace:       workplace,
		About:           about,
		RegistrationID:  registrationId,
		NICFile:         nicPath,
		CertificateFile: certPath,
		Status:          "pending",
	}

	initializers.DB.Create(&application)

	// -------- RESPONSE --------

	c.JSON(http.StatusOK, gin.H{
		"message": "Counsellor application submitted successfully",
	})
}

// GET APPROVED COUNSELLORS
func GetApprovedCounsellors(c *gin.Context) {
	var counsellors []models.CounsellorApplication

	initializers.DB.Where("status = ?", "approved").Find(&counsellors)

	c.JSON(http.StatusOK, counsellors)
}

// GET COUNSELLOR PROFILE -  /api/counsellor/profile/:userId
func GetCounsellorProfile(c *gin.Context) {

	userId := c.Param("userId")

	var counsellor models.CounsellorApplication

	err := initializers.DB.
		Where("user_id = ? AND status = ?", userId, "approved").
		First(&counsellor).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Counsellor profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, counsellor)
}

// UPDATE COUNSELLOR PROFILE
func UpdateCounsellorProfile(c *gin.Context) {

	userId := c.Param("userId")

	var counsellor models.CounsellorApplication

	// find counsellor by user id
	err := initializers.DB.
		Where("user_id = ?", userId).
		First(&counsellor).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Counsellor profile not found",
		})
		return
	}

	// request body struct
	var input struct {
		FullName       string `json:"fullName"`
		Specialization string `json:"specialization"`
		Qualification  string `json:"qualification"`
		Experience     int    `json:"experience"`
		RegistrationID string `json:"registrationID"`
		Workplace      string `json:"workplace"`
		About          string `json:"about"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid data",
		})
		return
	}

	// update fields
	// counsellor.FullName = input.FullName
	// counsellor.Specialization = input.Specialization
	// counsellor.Qualification = input.Qualification
	// counsellor.Experience = input.Experience
	// counsellor.RegistrationID = input.RegistrationID
	// counsellor.Workplace = input.Workplace
	// counsellor.About = input.About

	initializers.DB.Model(&counsellor).Updates(models.CounsellorApplication{
		FullName:       input.FullName,
		Specialization: input.Specialization,
		Qualification:  input.Qualification,
		Experience:     input.Experience,
		RegistrationID: input.RegistrationID,
		Workplace:      input.Workplace,
		About:          input.About,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
}

// UPDATE COUNSELLOR PROFILE IMAGE
func UploadProfileImage(c *gin.Context) {

	userId := c.Param("userId")

	var counsellor models.CounsellorApplication

	if err := initializers.DB.Where("user_id = ?", userId).First(&counsellor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Counsellor not found"})
		return
	}

	file, err := c.FormFile("profileImage")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	os.MkdirAll("./uploads/profile", os.ModePerm)

	path := filepath.Join("uploads/profile", file.Filename)

	c.SaveUploadedFile(file, path)

	counsellor.ProfileImage = path

	initializers.DB.Save(&counsellor)

	c.JSON(http.StatusOK, gin.H{
		"message":      "Profile image uploaded successfully",
		"profileImage": counsellor.ProfileImage,
	})
}

// REMOVE COUNSELLOR PROFILE IMAGE
func RemoveProfileImage(c *gin.Context) {
	userId := c.Param("userId")

	var counsellor models.CounsellorApplication

	if err := initializers.DB.Where("user_id = ?", userId).First(&counsellor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Counsellor not found"})
		return
	}

	counsellor.ProfileImage = ""

	initializers.DB.Save(&counsellor)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile image removed successfully",
	})
}

//============= AAISHA'S CONTROLLERS =============//

// GetCounsellorsForLocationAssignment returns approved counselors for admin location assignment.
func GetCounsellorsForLocationAssignment(c *gin.Context) {
	var counsellors []models.CounsellorApplication
	if err := initializers.DB.
		Where("status = ?", "approved").
		Order("full_name ASC").
		Find(&counsellors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load counsellors"})
		return
	}
	if counsellors == nil {
		counsellors = []models.CounsellorApplication{}
	}
	c.JSON(http.StatusOK, counsellors)
}

// AssignCounsellorLocation updates assigned workplace/location reason by counsellor user id.
func AssignCounsellorLocation(c *gin.Context) {
	userIDStr := c.Param("userId")
	targetUserID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor id"})
		return
	}

	var counsellor models.CounsellorApplication
	if err := initializers.DB.
		Where("user_id = ? AND status = ?", uint(targetUserID), "approved").
		First(&counsellor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Counsellor not found"})
		return
	}

	var input struct {
		Workplace      string `json:"workplace"`
		LocationReason string `json:"locationReason"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	workplace := strings.TrimSpace(input.Workplace)
	if workplace == "" || strings.EqualFold(workplace, "not assigned") {
		workplace = "Not Assigned"
	}

	// One physical location per room: no two approved counsellors may share the same workplace (except unassigned).
	if workplace != "Not Assigned" {
		var taken int64
		if err := initializers.DB.Model(&models.CounsellorApplication{}).
			Where("status = ? AND workplace = ? AND user_id != ?", "approved", workplace, uint(targetUserID)).
			Count(&taken).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate location"})
			return
		}
		if taken > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "This location is already assigned to another counselor"})
			return
		}
	}

	counsellor.Workplace = workplace
	counsellor.LocationReason = input.LocationReason
	if err := initializers.DB.Save(&counsellor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Location assigned successfully",
		"data":    counsellor,
	})
}

// GetMyAssignedLocation returns the logged-in user's assigned workplace and location note (approved counsellor only).
func GetMyAssignedLocation(c *gin.Context) {
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
	case uint64:
		userID = uint(v)
	case int:
		userID = uint(v)
	case int64:
		userID = uint(v)
	case string:
		parsed, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
			return
		}
		userID = uint(parsed)
	case json.Number:
		parsed, err := v.Int64()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
			return
		}
		userID = uint(parsed)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	var counsellor models.CounsellorApplication
	if err := initializers.DB.
		Where("user_id = ? AND status = ?", userID, "approved").
		First(&counsellor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Counsellor profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"workplace":        counsellor.Workplace,
		"locationReason":   counsellor.LocationReason,
		"assignLocation":   counsellor.Workplace,
		"locationNote":     counsellor.LocationReason,
	})
}
