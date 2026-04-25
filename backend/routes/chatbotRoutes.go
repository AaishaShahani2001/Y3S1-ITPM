package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func ChatbotRoutes(r *gin.Engine) {
	r.POST("/api/chatbot/message", controllers.ChatWithGemini)
}
