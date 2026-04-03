package models

import "time"

type Registration struct {
	ID uint `gorm:"primaryKey"`

	UserID  uint `gorm:"uniqueIndex:idx_user_event"`
	EventID uint `gorm:"uniqueIndex:idx_user_event"`

	Event Event `gorm:"foreignKey:EventID"`

	Name       string
	Email      string
	Phone      string
	University string
	Faculty    string
	Level      string
	Degree     string
	Gender     string

	Status string `gorm:"default:confirmed"` 

	CreatedAt time.Time
}