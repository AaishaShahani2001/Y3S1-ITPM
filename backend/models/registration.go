package models

import "time"

type Registration struct {
	ID uint `gorm:"primaryKey" json:"id"`

	UserID  uint `gorm:"uniqueIndex:idx_user_event" json:"user_id"`
	EventID uint `gorm:"uniqueIndex:idx_user_event" json:"event_id"`

	Event Event `gorm:"foreignKey:EventID" json:"event"`

	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	University string `json:"university"`
	Faculty    string `json:"faculty"`
	Level      string `json:"level"`
	Degree     string `json:"degree"`
	Gender     string `json:"gender"`

	QR string `json:"qr"` // ✅ VERY IMPORTANT

	Status string `gorm:"default:confirmed" json:"status"`

	Attended bool `gorm:"default:false" json:"attended"`

	CreatedAt time.Time `json:"created_at"`
}