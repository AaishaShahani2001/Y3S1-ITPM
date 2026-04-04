package controllers

import (
	"backend/initializers"
	"backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateAppointment(c *gin.Context) {

	var appointment models.Appointment
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

	// 1. Get form values
	appointment.BookingID = c.PostForm("bookingId")
	appointment.StudentID = user.ID
	appointment.StudentName = user.Name
	appointment.StudentEmail = user.Email

	counsellorID, err := strconv.Atoi(c.PostForm("counsellorId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor ID"})
		return
	}

	// Check if this is a counsellor application ID, if so get the user_id
	var counsellorApp models.CounsellorApplication
	appErr := initializers.DB.Where("id = ?", counsellorID).First(&counsellorApp).Error
	if appErr == nil {
		appointment.CounsellorID = counsellorApp.UserId
	} else {
		appointment.CounsellorID = uint(counsellorID)
	}

	appointment.Date = c.PostForm("date")
	appointment.TimeSlot = c.PostForm("timeSlot")
	appointment.Mood = c.PostForm("mood")
	appointment.ContactNumber = c.PostForm("contactNumber")
	appointment.GuardianPhoneNumber = c.PostForm("guardianPhoneNumber")

	age, ageErr := strconv.Atoi(c.PostForm("age"))
	if ageErr == nil {
		appointment.Age = age
	}

	urgency, _ := strconv.Atoi(c.PostForm("urgency"))
	appointment.Urgency = urgency

	appointment.MedicalNotes = c.PostForm("medicalNotes")

	// 2. Handle File Upload
	file, err := c.FormFile("report")

	if err == nil {
		// create uploads folder if not exists
		filePath := "uploads/report/" + file.Filename

		err = c.SaveUploadedFile(file, filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file",
			})
			return
		}

		appointment.ReportPath = filePath
	}

	// 3. Required Field Validation
	if appointment.CounsellorID == 0 ||
		appointment.Date == "" ||
		appointment.TimeSlot == "" ||
		appointment.Age <= 0 ||
		appointment.ContactNumber == "" ||
		appointment.GuardianPhoneNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Counsellor, date, time, age, contact number and guardian phone number are required",
		})
		return
	}

	// 4. Validate Date Format (YYYY-MM-DD)
	parsedDate, err := time.Parse("2006-01-02", appointment.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid date format. Use YYYY-MM-DD",
		})
		return
	}

	// Prevent past date booking
	if parsedDate.Before(time.Now().Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot book past dates",
		})
		return
	}

	// 5. Validate Time Slot against counsellor availability for this date
	// Frontend sends "hh:mm AM/PM" (e.g. "09:00 AM"), while availability stores "HH:MM" (24h).
	slotTime, parseErr := time.Parse("03:04 PM", appointment.TimeSlot)
	if parseErr != nil {
		// Fallback if hour is not zero-padded (e.g. "9:00 AM")
		slotTime, parseErr = time.Parse("3:04 PM", appointment.TimeSlot)
	}
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time slot selected",
		})
		return
	}

	slotHHMM := slotTime.Format("15:04")

	var availableSlot models.CounsellorAvailability
	err = initializers.DB.
		Where("counsellor_id = ? AND date = ? AND start_time = ?",
			appointment.CounsellorID, appointment.Date, slotHHMM,
		).
		First(&availableSlot).Error
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time slot selected",
		})
		return
	}

	// 6. Check for existing booking
	var existing models.Appointment

	err = initializers.DB.
		Where("counsellor_id = ? AND date = ? AND time_slot = ? AND status IN ?",
			appointment.CounsellorID, appointment.Date, appointment.TimeSlot,
			[]string{"Pending", "Confirmed"}).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This time slot is already booked",
		})
		return
	}

	// 7. Set Default Status
	appointment.Status = "Pending"

	// 8. Save to DB
	if err := initializers.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create appointment",
		})
		return
	}

	// 9. Success Response
	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment booked successfully",
		"data":    appointment,
	})

}

func GetBookedSlots(c *gin.Context) {

	counsellorIdParam := c.Query("counsellorId")
	date := c.Query("date")

	// Convert string ID to uint
	var counsellorId uint
	parsedId, err := strconv.ParseUint(counsellorIdParam, 10, 32)
	if err != nil {
		// Check if this is a counsellor application ID, if so get the user_id
		var counsellorApp models.CounsellorApplication
		appErr := initializers.DB.Where("id = ?", counsellorIdParam).First(&counsellorApp).Error
		if appErr == nil {
			counsellorId = counsellorApp.UserId
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor ID"})
			return
		}
	} else {
		counsellorId = uint(parsedId)
	}

	var appointments []models.Appointment

	err = initializers.DB.
		Where("counsellor_id = ? AND date = ? AND status IN ?",
			counsellorId,
			date,
			[]string{"Pending", "Confirmed"}).
		Find(&appointments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch slots",
		})
		return
	}

	var bookedSlots []string = []string{}
	for _, a := range appointments {
		bookedSlots = append(bookedSlots, a.TimeSlot)
	}

	c.JSON(http.StatusOK, gin.H{
		"bookedSlots": bookedSlots,
	})
}

type counselorAppointmentRow struct {
	models.Appointment
	StudentName    string `json:"studentName" gorm:"column:coalesced_student_name"`
	StudentEmail   string `json:"studentEmail" gorm:"column:coalesced_student_email"`
	AssignLocation string `json:"assignLocation" gorm:"column:assign_location"`
	LocationNote   string `json:"locationNote" gorm:"column:location_note"`
}

type studentAppointmentRow struct {
	models.Appointment
	CounselorName  string `json:"counselorName" gorm:"column:counselor_name"`
	CounselorEmail string `json:"counselorEmail" gorm:"column:counselor_email"`
}

// GetCounselorAppointments returns all appointments for the logged-in counselor.
func GetCounselorAppointments(c *gin.Context) {
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

	var appointments []counselorAppointmentRow
	err := initializers.DB.
		Table("appointments").
		Select(`
			appointments.*,
			COALESCE(NULLIF(users.name, ''), NULLIF(appointments.student_name, ''), 'Unknown Student') AS coalesced_student_name,
			COALESCE(NULLIF(users.email, ''), NULLIF(appointments.student_email, ''), 'No email available') AS coalesced_student_email,
			COALESCE(ca.workplace, '') AS assign_location,
			COALESCE(ca.location_reason, '') AS location_note
		`).
		Joins("LEFT JOIN users ON users.id = appointments.student_id").
		Joins(`LEFT JOIN counsellor_applications ca ON ca.user_id = appointments.counsellor_id AND ca.status = 'approved'`).
		Where("appointments.counsellor_id = ? AND appointments.status <> ?", user.ID, "Deleted").
		Order("appointments.date ASC, appointments.time_slot ASC").
		Scan(&appointments).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	if appointments == nil {
		appointments = []counselorAppointmentRow{}
	}
	c.JSON(http.StatusOK, appointments)
}

// GetStudentAppointments returns all appointments for the logged-in student.
func GetStudentAppointments(c *gin.Context) {
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

	var appointments []studentAppointmentRow
	err := initializers.DB.
		Table("appointments").
		Select(`
			appointments.*,
			COALESCE(NULLIF(users.name, ''), 'Counselor') AS counselor_name,
			COALESCE(NULLIF(users.email, ''), 'No email available') AS counselor_email
		`).
		Joins("LEFT JOIN users ON users.id = appointments.counsellor_id").
		Where("appointments.student_id = ?", user.ID).
		Order("appointments.date DESC, appointments.time_slot DESC").
		Scan(&appointments).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	if appointments == nil {
		appointments = []studentAppointmentRow{}
	}
	c.JSON(http.StatusOK, appointments)
}

// UpdateAppointmentForStudent lets the logged-in student update their own appointment details.
func UpdateAppointmentForStudent(c *gin.Context) {
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

	appointmentID := c.Param("id")
	var appointment models.Appointment
	if err := initializers.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	if appointment.StudentID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	if appointment.Status != "Pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending appointments can be edited"})
		return
	}

	var input struct {
		Age                 int    `json:"age"`
		ContactNumber       string `json:"contactNumber"`
		GuardianPhoneNumber string `json:"guardianPhoneNumber"`
		MedicalNotes        string `json:"medicalNotes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}
	if input.Age <= 0 || input.ContactNumber == "" || input.GuardianPhoneNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Age, contact number and guardian phone number are required"})
		return
	}

	appointment.Age = input.Age
	appointment.ContactNumber = input.ContactNumber
	appointment.GuardianPhoneNumber = input.GuardianPhoneNumber
	appointment.MedicalNotes = input.MedicalNotes

	if err := initializers.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment updated successfully"})
}

// DeleteAppointmentForStudent lets the logged-in student delete their own appointment.
func DeleteAppointmentForStudent(c *gin.Context) {
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

	appointmentID := c.Param("id")
	var appointment models.Appointment
	if err := initializers.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	if appointment.StudentID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	if appointment.Status == "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Completed appointments cannot be deleted"})
		return
	}

	// Pending appointments are marked as Deleted to keep history in student view.
	if appointment.Status == "Pending" {
		appointment.Status = "Deleted"
		if err := initializers.DB.Save(&appointment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully", "status": appointment.Status})
		return
	}

	// Confirmed appointments: keep record and store student cancellation note for counselor.
	var input struct {
		Note string `json:"note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cancellation note is required"})
		return
	}
	if input.Note == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cancellation note is required"})
		return
	}

	appointment.StudentCancelNote = input.Note
	if err := initializers.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send cancellation note"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cancellation note sent to counselor"})
}

// ApproveCancellationForCounselor converts a confirmed cancellation request to actual cancellation.
func ApproveCancellationForCounselor(c *gin.Context) {
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

	appointmentID := c.Param("id")
	var appointment models.Appointment
	if err := initializers.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	if appointment.CounsellorID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	if appointment.Status != "Confirmed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only confirmed appointments can be cancelled via approval"})
		return
	}
	if appointment.StudentCancelNote == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No cancellation request found for this appointment"})
		return
	}

	// Mark as cancelled so student can see approval state in history.
	// Booking availability checks only block Pending/Confirmed, so this still frees the slot.
	appointment.Status = "Cancelled"
	if err := initializers.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve cancellation"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cancellation approved and slot released", "status": appointment.Status})
}

// CancelAppointmentByCounselor lets counselor cancel Pending/Confirmed appointments with a note.
func CancelAppointmentByCounselor(c *gin.Context) {
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

	appointmentID := c.Param("id")
	var appointment models.Appointment
	if err := initializers.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	if appointment.CounsellorID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	if appointment.Status != "Pending" && appointment.Status != "Confirmed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending or confirmed appointments can be cancelled"})
		return
	}

	var input struct {
		Note string `json:"note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Note == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cancellation note is required"})
		return
	}

	appointment.Status = "Cancelled"
	appointment.CounselorCancelNote = input.Note
	if err := initializers.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment cancelled successfully",
		"status":  appointment.Status,
	})
}

// UpdateAppointmentStatusForCounselor handles status flow: Pending -> Confirmed -> Completed.
func UpdateAppointmentStatusForCounselor(c *gin.Context) {
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

	appointmentID := c.Param("id")
	var appointment models.Appointment
	if err := initializers.DB.First(&appointment, appointmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	if appointment.CounsellorID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	nextStatus := input.Status
	if nextStatus != "Confirmed" && nextStatus != "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// Enforce strict order: Pending -> Confirmed -> Completed
	if appointment.Status == "Pending" && nextStatus != "Confirmed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pending appointments can only be confirmed"})
		return
	}
	if appointment.Status == "Confirmed" && nextStatus != "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Confirmed appointments can only be completed"})
		return
	}
	if appointment.Status == "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Appointment is already completed"})
		return
	}

	appointment.Status = nextStatus
	if err := initializers.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment status updated successfully",
		"status":  appointment.Status,
	})
}
