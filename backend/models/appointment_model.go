package models

import (
	"time"

	"gorm.io/gorm"
)

type Appointment struct {
	gorm.Model
	//ID           uint      `gorm:"primaryKey" json:"id"`
	BookingID           string    `json:"bookingId"`
	StudentID           uint      `json:"studentId"`
	StudentName         string    `json:"studentName"`
	StudentEmail        string    `json:"studentEmail"`
	Age                 int       `json:"age"`
	ContactNumber       string    `json:"contactNumber"`
	GuardianPhoneNumber string    `json:"guardianPhoneNumber"`
	CounsellorID        uint      `json:"counsellorId"`
	Date                string    `json:"date"`
	TimeSlot            string    `json:"timeSlot"`
	Mood                string    `json:"mood"`
	Urgency             int       `json:"urgency"`
	MedicalNotes        string    `json:"medicalNotes"`
	StudentCancelNote   string    `json:"studentCancelNote"`
	CounselorCancelNote string    `json:"counselorCancelNote"`
	ReportPath          string    `json:"reportPath"`
	Status              string    `json:"status"` // Pending / Confirmed / Completed
	CreatedAt           time.Time `json:"createdAt"`
}
