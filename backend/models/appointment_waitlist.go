package models

import (
	"time"

	"gorm.io/gorm"
)

// AppointmentWaitlist queues students when a counselor time slot is fully booked (FIFO).
// Status: waiting → notified (slot freed) → fulfilled (booked) | cancelled.
type AppointmentWaitlist struct {
	gorm.Model
	StudentID    uint       `json:"studentId" gorm:"not null;index"`
	CounsellorID uint       `json:"counsellorId" gorm:"not null;index"`
	Date         string     `json:"date" gorm:"not null"`
	TimeSlot     string     `json:"timeSlot" gorm:"not null"`
	Urgency      int        `json:"urgency"`
	Status       string     `json:"status" gorm:"default:'waiting'"` // waiting | notified | fulfilled | cancelled
	NotifiedAt   *time.Time `json:"notifiedAt,omitempty"`
}
