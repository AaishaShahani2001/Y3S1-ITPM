package models

import "time"

type Event struct {
	ID          uint `gorm:"primaryKey"`
	Title       string
	Description string
	Date        string
	Time        string
	Location    string
	Capacity    int
	Image       string
	CreatedAt   time.Time
}
