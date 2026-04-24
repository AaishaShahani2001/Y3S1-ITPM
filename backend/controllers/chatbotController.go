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
	geminiMaxUserChars = 1200
)

var geminiModelCandidates = []string{
	"gemini-2.0-flash",
	"gemini-1.5-flash-latest",
	"gemini-1.5-pro-latest",
}

type chatbotRequest struct {
	Message string `json:"message"`
}

type geminiGenerateRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiContent struct {
	Role  string       `json:"role"`
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiGenerationConfig struct {
	Temperature     float64 `json:"temperature"`
	MaxOutputTokens int     `json:"maxOutputTokens"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func mentalHealthPrompt(userMessage string) string {
	return "You are MindBridge's mental wellbeing support assistant for university students. " +
		"Respond in a calm, empathetic, and practical way. Keep responses concise and supportive. " +
		"Do not diagnose medical conditions or prescribe medication. " +
		"If the user expresses immediate danger, self-harm, suicide, or harm to others, " +
		"tell them to contact local emergency services and a trusted person immediately. " +
		"Suggest booking a counsellor through MindBridge when appropriate.\n\nUser message: " + userMessage
}

func extractGeminiText(resp geminiGenerateResponse) (string, error) {
	if resp.Error != nil && strings.TrimSpace(resp.Error.Message) != "" {
		return "", errors.New(resp.Error.Message)
	}
	if len(resp.Candidates) == 0 {
		return "", errors.New("no response candidates from Gemini")
	}
	parts := resp.Candidates[0].Content.Parts
	if len(parts) == 0 {
		return "", errors.New("empty response from Gemini")
	}
	text := strings.TrimSpace(parts[0].Text)
	if text == "" {
		return "", errors.New("empty text response from Gemini")
	}
	return text, nil
}

func shouldTryNextModel(err error) bool {
	if err == nil {
		return false
	}
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "not found") ||
		strings.Contains(errMsg, "not supported") ||
		strings.Contains(errMsg, "unsupported") ||
		strings.Contains(errMsg, "invalid")
}

func callGeminiModel(httpClient *http.Client, apiKey, model string, requestBody []byte) (string, error) {
	endpoint := "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey
	httpReq, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", errors.New("failed to build AI request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(httpReq)
	if err != nil {
		return "", errors.New("AI service is unavailable right now")
	}
	defer resp.Body.Close()

	var geminiResp geminiGenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", errors.New("failed to decode AI response")
	}

	reply, err := extractGeminiText(geminiResp)
	if err != nil {
		return "", err
	}
	return reply, nil
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
	if len(message) > geminiMaxUserChars {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message is too long"})
		return
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server is missing GEMINI_API_KEY"})
		return
	}

	payload := geminiGenerateRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{Text: mentalHealthPrompt(message)},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			Temperature:     0.6,
			MaxOutputTokens: 320,
		},
	}

	requestBody, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare AI request"})
		return
	}

	httpClient := &http.Client{Timeout: 25 * time.Second}

	modelsToTry := make([]string, 0, len(geminiModelCandidates)+1)
	if envModel := strings.TrimSpace(os.Getenv("GEMINI_MODEL")); envModel != "" {
		modelsToTry = append(modelsToTry, envModel)
	}
	modelsToTry = append(modelsToTry, geminiModelCandidates...)

	var reply string
	var usedModel string
	var lastErr error
	for _, model := range modelsToTry {
		usedModel = model
		reply, lastErr = callGeminiModel(httpClient, apiKey, model, requestBody)
		if lastErr == nil {
			break
		}
		if !shouldTryNextModel(lastErr) {
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
