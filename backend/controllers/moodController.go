package controllers

import (
	"backend/initializers"
	"backend/models"
	"errors"
	"net/http"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Canonical categories that MUST match counsellor specializations in DB / BookAppointment.
var (
	ValidCategories = []string{
		"Academic Support",
		"Career Guidance",
		"Mental Health Specialist",
		"Emotional Regulation Expert",
		"Stress Management",
	}
)

// Pre-defined keyword rules: each category has phrases (strong match) and keywords (weaker match).
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

// Mood-to-category hints (when description scoring is low/ties).
var moodToCategory = map[string]string{
	"sad":      "Mental Health Specialist",
	"stressed": "Stress Management",
	"angry":    "Emotional Regulation Expert",
	"neutral":  "Career Guidance",
	"happy":    "Stress Management",
}

// buildRecommendation applies the shared rules engine to generate category + urgency.
func buildRecommendation(req models.MoodRequest) models.AIRecommendation {
	desc := strings.ToLower(req.Description)
	mood := strings.ToLower(req.Mood)
	intensity := req.Intensity

	scores := make(map[string]int)
	for _, cat := range ValidCategories {
		scores[cat] = 0
	}

	urgency := intensity

	// Apply pre-defined rules.
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

	// Mental health keywords increase urgency.
	if strings.Contains(desc, "anxiety") ||
		strings.Contains(desc, "depression") ||
		strings.Contains(desc, "panic") ||
		strings.Contains(desc, "suicidal") ||
		strings.Contains(desc, "self harm") {
		urgency += 2
	}

	// Mood-based hints (when description doesn't strongly indicate).
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

	// Determine best category (must be one of ValidCategories).
	bestCategory := ValidCategories[0]
	maxScore := -1
	for _, cat := range ValidCategories {
		if scores[cat] > maxScore {
			maxScore = scores[cat]
			bestCategory = cat
		}
	}

	// Tie/low score: use mood hint.
	if maxScore <= 0 {
		if hint, ok := moodToCategory[mood]; ok {
			bestCategory = hint
		}
	}

	// Urgency bounds.
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

	return models.AIRecommendation{
		Mood:    mood,
		Suggest: bestCategory,
		Urgency: urgency,
	}
}

func AnalyzeMoodDetails(c *gin.Context) {
	var req models.MoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	c.JSON(http.StatusOK, buildRecommendation(req))
}

// moodTrackerPayload defines supported daily mood-tracker input values.
type moodTrackerPayload struct {
	Date             string `json:"date" binding:"required"`
	Mood             string `json:"mood" binding:"required"`
	SleepQuality     int    `json:"sleepQuality" binding:"required"`
	SocialConnection int    `json:"socialConnection" binding:"required"`
	PhysicalActivity int    `json:"physicalActivity" binding:"required"`
	Mindfulness      int    `json:"mindfulness" binding:"required"`
	StressLevel      int    `json:"stressLevel" binding:"required"`
	EnergyLevel      int    `json:"energyLevel" binding:"required"`
}

type recommendedCounsellor struct {
	ID             uint   `json:"id"`
	UserID         uint   `json:"userId"`
	FullName       string `json:"fullName"`
	Email          string `json:"email"`
	Specialization string `json:"specialization"`
	Workplace      string `json:"workplace"`
	Experience     int    `json:"experience"`
}

type moodTrackerRecordResponse struct {
	ID                    uint                    `json:"id"`
	Date                  string                  `json:"date"`
	Mood                  string                  `json:"mood"`
	SleepQuality          int                     `json:"sleepQuality"`
	SocialConnection      int                     `json:"socialConnection"`
	PhysicalActivity      int                     `json:"physicalActivity"`
	Mindfulness           int                     `json:"mindfulness"`
	StressLevel           int                     `json:"stressLevel"`
	EnergyLevel           int                     `json:"energyLevel"`
	RecommendedType       string                  `json:"recommendedType"`
	RecommendationUrgency int                     `json:"recommendationUrgency"`
	RecommendedCounsellor []recommendedCounsellor `json:"recommendedCounsellor"`
}

// validateMetric enforces a 1..5 scale for each wellbeing metric.
func validateMetric(value int) bool { return value >= 1 && value <= 5 }

// getRecommendedCounsellors fetches approved counsellors matching the recommended specialization.
func getRecommendedCounsellors(category string) []recommendedCounsellor {
	var rows []models.CounsellorApplication
	initializers.DB.
		Where("status = ? AND LOWER(TRIM(specialization)) = LOWER(TRIM(?))", "approved", category).
		Order("experience DESC, full_name ASC").
		Limit(5).
		Find(&rows)

	out := make([]recommendedCounsellor, 0, len(rows))
	for _, row := range rows {
		out = append(out, recommendedCounsellor{
			ID:             row.ID,
			UserID:         row.UserId,
			FullName:       row.FullName,
			Email:          row.Email,
			Specialization: row.Specialization,
			Workplace:      row.Workplace,
			Experience:     row.Experience,
		})
	}
	return out
}

// UpsertMoodTrackerRecord creates or updates the student's mood entry for a given day.
func UpsertMoodTrackerRecord(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var payload moodTrackerPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Validate all metrics in one place.
	if !validateMetric(payload.SleepQuality) ||
		!validateMetric(payload.SocialConnection) ||
		!validateMetric(payload.PhysicalActivity) ||
		!validateMetric(payload.Mindfulness) ||
		!validateMetric(payload.StressLevel) ||
		!validateMetric(payload.EnergyLevel) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All metrics must be between 1 and 5"})
		return
	}

	// Derive intensity from stress and supporting factors.
	intensity := payload.StressLevel
	if payload.EnergyLevel <= 2 {
		intensity += 1
	}
	if payload.SleepQuality <= 2 {
		intensity += 1
	}

	// Build a compact descriptor string for the existing rules engine.
	descriptorParts := []string{}
	if payload.StressLevel >= 4 {
		descriptorParts = append(descriptorParts, "stress")
	}
	if payload.SleepQuality <= 2 {
		descriptorParts = append(descriptorParts, "tired exhausted")
	}
	if payload.SocialConnection <= 2 {
		descriptorParts = append(descriptorParts, "overthinking")
	}
	recommendation := buildRecommendation(models.MoodRequest{
		Mood:        payload.Mood,
		Intensity:   intensity,
		Description: strings.Join(descriptorParts, " "),
	})

	var row models.MoodTrackerEntry
	findErr := initializers.DB.
		Where("student_id = ? AND date = ?", user.ID, payload.Date).
		First(&row).Error

	// Upsert one record per day per student.
	row.StudentID = user.ID
	row.Date = payload.Date
	row.Mood = payload.Mood
	row.SleepQuality = payload.SleepQuality
	row.SocialConnection = payload.SocialConnection
	row.PhysicalActivity = payload.PhysicalActivity
	row.Mindfulness = payload.Mindfulness
	row.StressLevel = payload.StressLevel
	row.EnergyLevel = payload.EnergyLevel
	row.RecommendedType = recommendation.Suggest
	row.RecommendationUrg = recommendation.Urgency

	if errors.Is(findErr, gorm.ErrRecordNotFound) {
		if err := initializers.DB.Create(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create mood record"})
			return
		}
	} else if findErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load existing mood record"})
		return
	} else {
		if err := initializers.DB.Save(&row).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update mood record"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":               "Mood record saved",
		"recommendedType":       row.RecommendedType,
		"recommendationUrgency": row.RecommendationUrg,
		"recommendedCounsellor": getRecommendedCounsellors(row.RecommendedType),
	})
}

// GetMoodTrackerRecords returns student's saved mood records with matched counsellor suggestions.
func GetMoodTrackerRecords(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var rows []models.MoodTrackerEntry
	if err := initializers.DB.Where("student_id = ?", user.ID).Order("date DESC, id DESC").Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch mood records"})
		return
	}

	// Cache recommendation lists by specialization to avoid repeated queries.
	recommendationCache := map[string][]recommendedCounsellor{}
	out := make([]moodTrackerRecordResponse, 0, len(rows))
	for _, row := range rows {
		if _, ok := recommendationCache[row.RecommendedType]; !ok {
			recommendationCache[row.RecommendedType] = getRecommendedCounsellors(row.RecommendedType)
		}
		out = append(out, moodTrackerRecordResponse{
			ID:                    row.ID,
			Date:                  row.Date,
			Mood:                  row.Mood,
			SleepQuality:          row.SleepQuality,
			SocialConnection:      row.SocialConnection,
			PhysicalActivity:      row.PhysicalActivity,
			Mindfulness:           row.Mindfulness,
			StressLevel:           row.StressLevel,
			EnergyLevel:           row.EnergyLevel,
			RecommendedType:       row.RecommendedType,
			RecommendationUrgency: row.RecommendationUrg,
			RecommendedCounsellor: recommendationCache[row.RecommendedType],
		})
	}

	// Keep newest-first ordering stable.
	sort.SliceStable(out, func(i, j int) bool { return out[i].Date > out[j].Date })
	c.JSON(http.StatusOK, out)
}

// DeleteMoodTrackerRecord deletes one mood record owned by the current student.
func DeleteMoodTrackerRecord(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var row models.MoodTrackerEntry
	if err := initializers.DB.First(&row, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mood record not found"})
		return
	}
	if row.StudentID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	if err := initializers.DB.Delete(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete mood record"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mood record deleted"})
}

// DeleteMoodTrackerRecordByDate provides a compatibility delete path using date query param.
func DeleteMoodTrackerRecordByDate(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	date := strings.TrimSpace(c.Query("date"))
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date query parameter is required"})
		return
	}

	var row models.MoodTrackerEntry
	if err := initializers.DB.
		Where("student_id = ? AND date = ?", user.ID, date).
		First(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mood record not found"})
		return
	}

	if err := initializers.DB.Delete(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete mood record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mood record deleted"})
}

// UpdateMoodTrackerRecord edits one existing mood record by ID for the current student.
func UpdateMoodTrackerRecord(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userVal.(models.User)
	if !ok || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var row models.MoodTrackerEntry
	if err := initializers.DB.First(&row, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mood record not found"})
		return
	}
	if row.StudentID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	var payload moodTrackerPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Validate all metrics in one place.
	if !validateMetric(payload.SleepQuality) ||
		!validateMetric(payload.SocialConnection) ||
		!validateMetric(payload.PhysicalActivity) ||
		!validateMetric(payload.Mindfulness) ||
		!validateMetric(payload.StressLevel) ||
		!validateMetric(payload.EnergyLevel) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All metrics must be between 1 and 5"})
		return
	}

	// Re-run recommendation after edits so the counselor suggestion stays in sync.
	intensity := payload.StressLevel
	if payload.EnergyLevel <= 2 {
		intensity += 1
	}
	if payload.SleepQuality <= 2 {
		intensity += 1
	}
	descriptorParts := []string{}
	if payload.StressLevel >= 4 {
		descriptorParts = append(descriptorParts, "stress")
	}
	if payload.SleepQuality <= 2 {
		descriptorParts = append(descriptorParts, "tired exhausted")
	}
	if payload.SocialConnection <= 2 {
		descriptorParts = append(descriptorParts, "overthinking")
	}
	recommendation := buildRecommendation(models.MoodRequest{
		Mood:        payload.Mood,
		Intensity:   intensity,
		Description: strings.Join(descriptorParts, " "),
	})

	row.Date = payload.Date
	row.Mood = payload.Mood
	row.SleepQuality = payload.SleepQuality
	row.SocialConnection = payload.SocialConnection
	row.PhysicalActivity = payload.PhysicalActivity
	row.Mindfulness = payload.Mindfulness
	row.StressLevel = payload.StressLevel
	row.EnergyLevel = payload.EnergyLevel
	row.RecommendedType = recommendation.Suggest
	row.RecommendationUrg = recommendation.Urgency

	if err := initializers.DB.Save(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update mood record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":               "Mood record updated",
		"recommendedType":       row.RecommendedType,
		"recommendationUrgency": row.RecommendationUrg,
		"recommendedCounsellor": getRecommendedCounsellors(row.RecommendedType),
	})
}
