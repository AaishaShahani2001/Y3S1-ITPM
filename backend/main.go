package main

import (
	"backend/email"
	"backend/initializers"
	"backend/routes"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	email.Init()
	initializers.ConnectDB()
	initializers.SyncDatabase()
}

func main() {
	r := gin.Default()

	// PROXY WARNING
	//r.SetTrustedProxies([]string{"127.0.0.1"})
	r.Static("/uploads", "./uploads")

	// CORS CONFIGURATION
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.SetupRoutes(r)
	routes.EventRoutes(r)

	// Default :3000 so it matches the frontend API base (http://localhost:3000). Override with PORT in .env.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)
}
