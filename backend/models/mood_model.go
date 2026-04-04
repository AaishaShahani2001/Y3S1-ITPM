package models

import "gorm.io/gorm"

type MoodRequest struct {
	gorm.Model
	Mood        string `json:"mood" binding:"required"`
	Intensity   int    `json:"intensity" binding:"required"`
	Description string `json:"description"`
}

type AIRecommendation struct {
	gorm.Model
	Mood    string `json:"mood"`
	Suggest string `json:"suggest"`
	Urgency int    `json:"urgency"`
}
