package models

import "time"

type Registration struct {
	ID         uint      `gorm:"primaryKey"`
	EventID    int
	Name       string
	Email      string
	Phone      string
	University string
	Faculty    string
	Level      string
	Degree     string
	CreatedAt  time.Time
}