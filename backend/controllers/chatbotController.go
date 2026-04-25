package controllers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	chatbotMaxUserChars = 1200
)

var groqModelCandidates = []string{
	"llama-3.1-8b-instant",
	"llama-3.3-70b-versatile",
}

type chatbotRequest struct {
	Message string `json:"message"`
}

type groqChatRequest struct {
	Model       string        `json:"model"`
	Messages    []groqMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type groqChatResponse struct {
	Choices []struct {
		Message groqMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func mentalHealthSystemPrompt() string {
	return "You are MindBridge's mental wellbeing support assistant for university students. " +
		"Respond in a calm, empathetic, and practical way. Keep responses concise and supportive. " +
		"Do not diagnose medical conditions or prescribe medication. " +
		"If the user expresses immediate danger, self-harm, suicide, or harm to others, " +
		"tell them to contact local emergency services and a trusted person immediately. " +
		"Suggest booking a counsellor through MindBridge when appropriate."
}

func extractGroqText(resp groqChatResponse) (string, error) {
	if resp.Error != nil && strings.TrimSpace(resp.Error.Message) != "" {
		return "", errors.New(resp.Error.Message)
	}
	if len(resp.Choices) == 0 {
		return "", errors.New("no response choices from Groq")
	}
	text := strings.TrimSpace(resp.Choices[0].Message.Content)
	if text == "" {
		return "", errors.New("empty text response from Groq")
	}
	return text, nil
}

func callGroq(httpClient *http.Client, apiKey string, requestBody []byte) (string, error) {
	endpoint := "https://api.groq.com/openai/v1/chat/completions"
	httpReq, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", errors.New("failed to build AI request")
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := httpClient.Do(httpReq)
	if err != nil {
		return "", errors.New("AI service is unavailable right now")
	}
	defer resp.Body.Close()

	var groqResp groqChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", errors.New("failed to decode AI response")
	}

	reply, err := extractGroqText(groqResp)
	if err != nil {
		return "", err
	}
	return reply, nil
}

func shouldTryNextGroqModel(err error) bool {
	if err == nil {
		return false
	}
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "decommissioned") ||
		strings.Contains(errMsg, "not supported") ||
		strings.Contains(errMsg, "invalid model") ||
		strings.Contains(errMsg, "model")
}

func ChatWithGemini(c *gin.Context) {
	var req chatbotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	message := strings.TrimSpace(req.Message)
	if message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message is required"})
		return
	}
	if len(message) > chatbotMaxUserChars {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message is too long"})
		return
	}

	apiKey := strings.TrimSpace(os.Getenv("GROQ_API_KEY"))
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server is missing GROQ_API_KEY"})
		return
	}

	modelsToTry := make([]string, 0, len(groqModelCandidates)+1)
	if envModel := strings.TrimSpace(os.Getenv("GROQ_MODEL")); envModel != "" {
		modelsToTry = append(modelsToTry, envModel)
	}
	modelsToTry = append(modelsToTry, groqModelCandidates...)

	httpClient := &http.Client{Timeout: 25 * time.Second}

	var reply string
	var usedModel string
	var lastErr error
	for _, model := range modelsToTry {
		payload := groqChatRequest{
			Model: model,
			Messages: []groqMessage{
				{Role: "system", Content: mentalHealthSystemPrompt()},
				{Role: "user", Content: message},
			},
			Temperature: 0.6,
			MaxTokens:   320,
		}

		requestBody, err := json.Marshal(payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare AI request"})
			return
		}

		usedModel = model
		reply, lastErr = callGroq(httpClient, apiKey, requestBody)
		if lastErr == nil {
			break
		}
		if !shouldTryNextGroqModel(lastErr) {
			break
		}
	}
	if lastErr != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI response error: " + lastErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reply": reply,
		"model": usedModel,
	})
}
