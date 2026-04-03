package models

import (
	"time"

	"gorm.io/gorm"
)

// CounsellorAvailability represents one available time slot
type CounsellorAvailability struct {
	gorm.Model

	ID uint `gorm:"primaryKey" json:"id"`

	CounsellorID uint `json:"counsellorId"` // linked to counsellor user

	Date string `json:"date"` // YYYY-MM-DD format

	StartTime string `json:"startTime" gorm:"column:start_time"` // HH:MM
	EndTime   string `json:"endTime" gorm:"column:end_time"`     // HH:MM

	Status string `json:"status"` // available | booked | cancelled

	CreatedAt time.Time
}
