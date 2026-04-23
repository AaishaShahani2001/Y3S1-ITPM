package initializers

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var err error
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("DB")
	}
	if dsn == "" {
		panic("DATABASE_URL (or DB) is not set")
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to database!")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		panic("Failed to initialize SQL database instance!")
	}

	if err = sqlDB.Ping(); err != nil {
		panic("Connected driver but failed to reach database!")
	}

	log.Println("Database connected successfully.")
}
