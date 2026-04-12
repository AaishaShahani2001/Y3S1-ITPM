package controllers

import (
	"backend/initializers"
	"backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// PromoteNextWaitlistForSlot notifies the next waiting student when a slot becomes free.
func PromoteNextWaitlistForSlot(counsellorID uint, date, timeSlot string) {
	var next models.AppointmentWaitlist
	err := initializers.DB.
		Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status = ?",
			counsellorID, date, timeSlot, "waiting").
		Order("created_at ASC").
		First(&next).Error
	if err != nil {
		return
	}
	now := time.Now()
	next.Status = "notified"
	next.NotifiedAt = &now
	_ = initializers.DB.Save(&next).Error
}

// FulfillWaitlistForStudentOnBooking marks waitlist rows fulfilled after a successful booking.
func FulfillWaitlistForStudentOnBooking(studentID, counsellorID uint, date, timeSlot string) {
	initializers.DB.Model(&models.AppointmentWaitlist{}).
		Where("student_id = ? AND counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ?",
			studentID, counsellorID, date, timeSlot, []string{"waiting", "notified"}).
		Update("status", "fulfilled")
}

func resolveCounsellorUserIDFromParam(counsellorParam string) (uint, error) {
	parsed, err := strconv.ParseUint(counsellorParam, 10, 32)
	if err != nil {
		var counsellorApp models.CounsellorApplication
		if err2 := initializers.DB.Where("id = ?", counsellorParam).First(&counsellorApp).Error; err2 != nil {
			return 0, err2
		}
		return counsellorApp.UserId, nil
	}
	return uint(parsed), nil
}

// JoinAppointmentWaitlist — student joins queue when the slot is already booked.
func JoinAppointmentWaitlist(c *gin.Context) {
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
	if user.Role != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only students can join the waitlist"})
		return
	}

	var input struct {
		CounsellorID string `json:"counsellorId"`
		Date         string `json:"date"`
		TimeSlot     string `json:"timeSlot"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}
	if input.CounsellorID == "" || input.Date == "" || input.TimeSlot == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "counsellorId, date and timeSlot are required"})
		return
	}

	counsellorID, err := resolveCounsellorUserIDFromParam(input.CounsellorID)
	if err != nil || counsellorID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor"})
		return
	}

	// Slot must exist in availability
	slotTime, parseErr := time.Parse("03:04 PM", input.TimeSlot)
	if parseErr != nil {
		slotTime, parseErr = time.Parse("3:04 PM", input.TimeSlot)
	}
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time slot format"})
		return
	}
	slotHHMM := slotTime.Format("15:04")
	var avail models.CounsellorAvailability
	if err := initializers.DB.Where("counsellor_id = ? AND date = ? AND start_time = ?",
		counsellorID, input.Date, slotHHMM).First(&avail).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This time is not offered by the counselor"})
		return
	}

	// Slot must be full (pending or confirmed booking)
	var booked models.Appointment
	err = initializers.DB.Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ?",
		counsellorID, input.Date, input.TimeSlot, []string{"Pending", "Confirmed"}).
		First(&booked).Error
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This slot is available — book directly instead of joining the waitlist"})
		return
	}

	var dup models.AppointmentWaitlist
	err = initializers.DB.Where("student_id = ? AND counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ?",
		user.ID, counsellorID, input.Date, input.TimeSlot, []string{"waiting", "notified"}).
		First(&dup).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You are already on the waitlist for this slot"})
		return
	}

	entry := models.AppointmentWaitlist{
		StudentID:    user.ID,
		CounsellorID: counsellorID,
		Date:         input.Date,
		TimeSlot:     input.TimeSlot,
		Status:       "waiting",
	}
	if err := initializers.DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join waitlist"})
		return
	}

	var pos int64
	initializers.DB.Model(&models.AppointmentWaitlist{}).
		Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ? AND id <= ?",
			counsellorID, input.Date, input.TimeSlot, []string{"waiting", "notified"}, entry.ID).
		Count(&pos)

	c.JSON(http.StatusOK, gin.H{
		"message":       "Joined waitlist",
		"id":            entry.ID,
		"queuePosition": int(pos),
		"data":          entry,
	})
}

type studentWaitlistOut struct {
	models.AppointmentWaitlist
	CounselorName  string `json:"counselorName"`
	Specialization string `json:"specialization"`
	QueuePosition  int    `json:"queuePosition"`
}

// GetStudentWaitlist returns the logged-in student's active waitlist entries.
func GetStudentWaitlist(c *gin.Context) {
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

	var entries []models.AppointmentWaitlist
	if err := initializers.DB.Where("student_id = ? AND status IN ?", user.ID, []string{"waiting", "notified"}).
		Order("date ASC, created_at ASC").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load waitlist"})
		return
	}

	out := make([]studentWaitlistOut, 0, len(entries))
	for _, e := range entries {
		var ca models.CounsellorApplication
		_ = initializers.DB.Where("user_id = ? AND status = ?", e.CounsellorID, "approved").First(&ca).Error

		var pos int64
		initializers.DB.Model(&models.AppointmentWaitlist{}).
			Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ? AND id <= ?",
				e.CounsellorID, e.Date, e.TimeSlot, []string{"waiting", "notified"}, e.ID).
			Count(&pos)

		out = append(out, studentWaitlistOut{
			AppointmentWaitlist: e,
			CounselorName:     ca.FullName,
			Specialization:    ca.Specialization,
			QueuePosition:     int(pos),
		})
	}

	c.JSON(http.StatusOK, out)
}

// LeaveAppointmentWaitlist removes the student from the queue.
func LeaveAppointmentWaitlist(c *gin.Context) {
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

	id := c.Param("id")
	var entry models.AppointmentWaitlist
	if err := initializers.DB.First(&entry, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Waitlist entry not found"})
		return
	}
	if entry.StudentID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	if entry.Status == "fulfilled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot leave a fulfilled queue entry"})
		return
	}
	entry.Status = "cancelled"
	if err := initializers.DB.Save(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to leave waitlist"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Left waitlist"})
}

type counselorWaitlistOut struct {
	models.AppointmentWaitlist
	StudentName string `json:"studentName"`
	QueuePosition int `json:"queuePosition"`
}

// GetCounselorWaitlist lists waitlist entries for the logged-in counselor.
func GetCounselorWaitlist(c *gin.Context) {
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
	if user.Role != "counselor" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	var entries []models.AppointmentWaitlist
	if err := initializers.DB.Where("counsellor_id = ? AND status IN ?", user.ID, []string{"waiting", "notified"}).
		Order("date ASC, created_at ASC").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load waitlist"})
		return
	}

	out := make([]counselorWaitlistOut, 0, len(entries))
	for _, e := range entries {
		var st models.User
		_ = initializers.DB.First(&st, e.StudentID).Error
		var pos int64
		initializers.DB.Model(&models.AppointmentWaitlist{}).
			Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ? AND id <= ?",
				e.CounsellorID, e.Date, e.TimeSlot, []string{"waiting", "notified"}, e.ID).
			Count(&pos)
		out = append(out, counselorWaitlistOut{
			AppointmentWaitlist: e,
			StudentName:         st.Name,
			QueuePosition:       int(pos),
		})
	}
	c.JSON(http.StatusOK, out)
}
