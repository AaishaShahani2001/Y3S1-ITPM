package models

import "gorm.io/gorm"

// MoodTrackerEntry stores one daily wellbeing record per student.
type MoodTrackerEntry struct {
	gorm.Model
	StudentID         uint   `json:"studentId" gorm:"not null;index:idx_student_date,unique"`
	Date              string `json:"date" gorm:"type:date;not null;index:idx_student_date,unique"`
	Mood              string `json:"mood" gorm:"type:varchar(30);not null"`
	SleepQuality      int    `json:"sleepQuality" gorm:"not null"`
	SocialConnection  int    `json:"socialConnection" gorm:"not null"`
	PhysicalActivity  int    `json:"physicalActivity" gorm:"not null"`
	Mindfulness       int    `json:"mindfulness" gorm:"not null"`
	StressLevel       int    `json:"stressLevel" gorm:"not null"`
	EnergyLevel       int    `json:"energyLevel" gorm:"not null"`
	RecommendedType   string `json:"recommendedType" gorm:"type:varchar(80)"`
	RecommendationUrg int    `json:"recommendationUrgency"`
}
