package initializers

import "backend/models"

func SyncDatabase() {
	DB.AutoMigrate(&models.User{},
		&models.Event{},
		&models.Registration{},
		&models.CounsellorApplication{},
		&models.Appointment{},
		&models.CounsellorAvailability{},
		&models.MoodRequest{},
		&models.AIRecommendation{},
	)
}
