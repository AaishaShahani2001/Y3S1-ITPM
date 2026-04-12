package controllers

import (
	"backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Canonical categories that MUST match counsellor specializations in DB / BookAppointment
var (
	ValidCategories = []string{
		"Academic Support",
		"Career Guidance",
		"Mental Health Specialist",
		"Emotional Regulation Expert",
		"Stress Management",
	}
)

// Pre-defined keyword rules: each category has phrases (strong match) and keywords (weaker match)
var categoryRules = map[string]struct {
	phrases  []string // strong match: +5
	keywords []string // weaker match: +2 or +3
}{
	"Academic Support": {
		phrases:  []string{"study help", "exam help", "assignment help", "project help", "thesis help"},
		keywords: []string{"exam", "assignment", "study", "deadline", "lecture", "grades", "failed", "failing"},
	},
	"Career Guidance": {
		phrases:  []string{"job search", "career change", "internship", "resume", "interview"},
		keywords: []string{"job", "career", "future", "internship", "employment"},
	},
	"Mental Health Specialist": {
		phrases:  []string{"anxiety attack", "panic attack", "suicidal", "self harm"},
		keywords: []string{"anxiety", "depression", "panic", "overthinking", "hopeless", "worthless"},
	},
	"Emotional Regulation Expert": {
		phrases:  []string{"anger management", "emotional outburst"},
		keywords: []string{"anger", "frustrated", "irritable", "out of control"},
	},
	"Stress Management": {
		phrases:  []string{"burnout", "overwhelmed", "cannot cope"},
		keywords: []string{"stress", "stressed", "pressure", "tired", "exhausted"},
	},
}

// Mood-to-category hints (when description scoring is low/ties)
var moodToCategory = map[string]string{
	"sad":      "Mental Health Specialist",
	"stressed": "Stress Management",
	"angry":    "Emotional Regulation Expert",
	"neutral":  "Career Guidance",
	"happy":    "Stress Management",
}

func AnalyzeMoodDetails(c *gin.Context) {

	var req models.MoodRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	desc := strings.ToLower(req.Description)
	mood := strings.ToLower(req.Mood)
	intensity := req.Intensity

	scores := make(map[string]int)
	for _, cat := range ValidCategories {
		scores[cat] = 0
	}

	urgency := intensity

	// Apply pre-defined rules
	for category, rules := range categoryRules {
		for _, phrase := range rules.phrases {
			if strings.Contains(desc, phrase) {
				scores[category] += 5
			}
		}
		for _, kw := range rules.keywords {
			if strings.Contains(desc, kw) {
				scores[category] += 3
			}
		}
	}

	// Mental health keywords increase urgency
	if strings.Contains(desc, "anxiety") ||
		strings.Contains(desc, "depression") ||
		strings.Contains(desc, "panic") ||
		strings.Contains(desc, "suicidal") ||
		strings.Contains(desc, "self harm") {
		urgency += 2
	}

	// Mood-based hints (when description doesn't strongly indicate)
	switch mood {
	case "sad":
		scores["Mental Health Specialist"] += 2
	case "stressed":
		scores["Stress Management"] += 2
	case "angry":
		scores["Emotional Regulation Expert"] += 2
	case "neutral":
		scores["Career Guidance"] += 1
	case "happy":
		scores["Stress Management"] += 1
	}

	// Determine best category (must be one of ValidCategories)
	bestCategory := ValidCategories[0]
	maxScore := -1

	for _, cat := range ValidCategories {
		if scores[cat] > maxScore {
			maxScore = scores[cat]
			bestCategory = cat
		}
	}

	// Tie/low score: use mood hint
	if maxScore <= 0 {
		if hint, ok := moodToCategory[mood]; ok {
			bestCategory = hint
		}
	}

	// Urgency bounds
	if intensity >= 8 {
		urgency += 2
	} else if intensity >= 5 {
		urgency += 1
	}
	if urgency > 10 {
		urgency = 10
	}
	if urgency < 1 {
		urgency = 1
	}

	res := models.AIRecommendation{
		Mood:    mood,
		Suggest: bestCategory,
		Urgency: urgency,
	}

	c.JSON(http.StatusOK, res)
}
