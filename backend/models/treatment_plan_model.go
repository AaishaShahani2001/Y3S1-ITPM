package models

import "time"

type TreatmentPlan struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	AppointmentID uint      `json:"appointment_id"`
	CounsellorID  uint      `json:"counsellor_id"`
	StudentID     uint      `json:"student_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}