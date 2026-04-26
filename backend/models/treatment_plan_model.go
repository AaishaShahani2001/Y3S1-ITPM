package models

import (
	"encoding/json"
	"time"
)

type TreatmentPlan struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	AppointmentID uint            `json:"appointment_id"`
	CounsellorID  uint            `json:"counsellor_id"`
	StudentID     uint            `json:"student_id"`
	Title         string          `json:"title"`
	Description   string          `json:"description"`
	Status        string          `json:"status"`
	StepsData     json.RawMessage `json:"steps_data" gorm:"type:jsonb;default:'{}'"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}