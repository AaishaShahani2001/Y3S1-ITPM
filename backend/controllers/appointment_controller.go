package controllers

import (
	"backend/email"
	"backend/initializers"
	"backend/models"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func normalizeAppointmentTimeSlot(raw string) (string, string, error) {
	clean := strings.TrimSpace(raw)
	layouts := []string{
		"03:04 PM",
		"3:04 PM",
		"03:04:05 PM",
		"3:04:05 PM",
		"15:04",
		"15:04:05",
	}

	var parsed time.Time
	var err error
	for _, layout := range layouts {
		parsed, err = time.Parse(layout, clean)
		if err == nil {
			return parsed.Format("03:04 PM"), parsed.Format("15:04"), nil
		}
	}
	return "", "", err
}

func resolveCounsellorIDs(rawID string) (uint, []uint, error) {
	parsedID, err := strconv.ParseUint(strings.TrimSpace(rawID), 10, 32)
	if err != nil || parsedID == 0 {
		return 0, nil, err
	}

	primaryID := uint(parsedID)
	candidates := []uint{primaryID}

	var counsellorApp models.CounsellorApplication
	if appErr := initializers.DB.Where("id = ?", primaryID).First(&counsellorApp).Error; appErr == nil && counsellorApp.UserId != 0 {
		if counsellorApp.UserId != primaryID {
			candidates = append(candidates, counsellorApp.UserId)
		}
	}

	seen := make(map[uint]struct{}, len(candidates))
	unique := make([]uint, 0, len(candidates))
	for _, id := range candidates {
		if id == 0 {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		unique = append(unique, id)
	}

	return primaryID, unique, nil
}

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

	counsellorRawID := c.PostForm("counsellorId")
	_, counsellorCandidates, err := resolveCounsellorIDs(counsellorRawID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor ID"})
		return
	}
	appointment.CounsellorID = counsellorCandidates[0]

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
	// Accept multiple input formats from clients and normalize consistently.
	normalizedSlot, slotHHMM, parseErr := normalizeAppointmentTimeSlot(appointment.TimeSlot)
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time slot selected",
		})
		return
	}
	appointment.TimeSlot = normalizedSlot

	var availableSlot models.CounsellorAvailability
	err = initializers.DB.
		Where("counsellor_id IN ? AND date = ? AND start_time IN ?",
			counsellorCandidates, appointment.Date, []string{slotHHMM, slotHHMM + ":00"},
		).
		First(&availableSlot).Error
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time slot selected",
		})
		return
	}
	appointment.CounsellorID = availableSlot.CounsellorID

	// 6. Check for existing booking
	var existing models.Appointment

	err = initializers.DB.
		Where("counsellor_id = ? AND date = ? AND time_slot IN ? AND status IN ?",
			availableSlot.CounsellorID, appointment.Date,
			[]string{appointment.TimeSlot, strings.TrimLeft(appointment.TimeSlot, "0")},
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

	FulfillWaitlistForStudentOnBooking(user.ID, appointment.CounsellorID, appointment.Date, appointment.TimeSlot)

	// 9. Success Response
	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment booked successfully",
		"data":    appointment,
	})

}

func GetBookedSlots(c *gin.Context) {

	counsellorIdParam := c.Query("counsellorId")
	date := c.Query("date")

	_, counsellorCandidates, err := resolveCounsellorIDs(counsellorIdParam)
	if err != nil || len(counsellorCandidates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid counsellor ID"})
		return
	}

	var appointments []models.Appointment

	err = initializers.DB.
		Where("counsellor_id IN ? AND date = ? AND status IN ?",
			counsellorCandidates,
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

		PromoteNextWaitlistForSlot(appointment.CounsellorID, appointment.Date, appointment.TimeSlot)
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
	PromoteNextWaitlistForSlot(appointment.CounsellorID, appointment.Date, appointment.TimeSlot)
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

	PromoteNextWaitlistForSlot(appointment.CounsellorID, appointment.Date, appointment.TimeSlot)

	// Send cancellation email to the student (non-blocking).
	if err := email.SendAppointmentCancelledByCounselor(
		appointment.StudentEmail,
		appointment.StudentName,
		user.Name,
		appointment.Date,
		appointment.TimeSlot,
		appointment.CounselorCancelNote,
	); err != nil {
		log.Printf("appointment cancellation email failed: appointment=%d err=%v", appointment.ID, err)
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

	// When counselor confirms, notify the student via email (non-blocking).
	if nextStatus == "Confirmed" {
		if err := email.SendAppointmentConfirmed(
			appointment.StudentEmail,
			appointment.StudentName,
			user.Name,
			appointment.Date,
			appointment.TimeSlot,
		); err != nil {
			log.Printf("appointment confirmation email failed: appointment=%d err=%v", appointment.ID, err)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment status updated successfully",
		"status":  appointment.Status,
	})
}
