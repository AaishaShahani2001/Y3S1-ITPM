package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"backend/initializers"
	"backend/models"
)

type treatmentPlanListResponse struct {
	ID             uint            `json:"id"`
	AppointmentID  uint            `json:"appointment_id"`
	CounsellorID   uint            `json:"counsellor_id"`
	StudentID      uint            `json:"student_id"`
	Title          string          `json:"title"`
	Description    string          `json:"description"`
	Status         string          `json:"status"`
	StudentName    string          `json:"student_name"`
	CounsellorName string          `json:"counsellor_name"`
	StepsData      json.RawMessage `json:"steps_data"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func parseStepsDocument(raw json.RawMessage) (models.TreatmentPlanStepsDocument, error) {
	var doc models.TreatmentPlanStepsDocument
	if len(raw) == 0 || string(raw) == "null" {
		return doc, nil
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		return doc, err
	}
	return doc, nil
}

func mustMarshalSteps(doc models.TreatmentPlanStepsDocument) (json.RawMessage, error) {
	b, err := json.Marshal(doc)
	if err != nil {
		return nil, err
	}
	return json.RawMessage(b), nil
}

func normalizeSteps(doc *models.TreatmentPlanStepsDocument) {
	for len(doc.Steps) < 4 {
		doc.Steps = append(doc.Steps, models.TreatmentPlanStepEntry{})
	}
	if len(doc.Steps) > 4 {
		doc.Steps = doc.Steps[:4]
	}
}

func recomputePlanStatusFromSteps(doc *models.TreatmentPlanStepsDocument) string {
	normalizeSteps(doc)
	if len(doc.Steps) != 4 {
		return "Active"
	}
	for _, s := range doc.Steps {
		if !s.Completed {
			return "Active"
		}
	}
	return "Completed"
}

func mergeStudentStepUpdate(existing, incoming models.TreatmentPlanStepsDocument) (models.TreatmentPlanStepsDocument, error) {
	normalizeSteps(&existing)
	normalizeSteps(&incoming)
	if len(incoming.Steps) != 4 {
		return existing, fmt.Errorf("need 4 steps")
	}
	out := existing
	for i := 0; i < 4; i++ {
		if incoming.Steps[i].Title != existing.Steps[i].Title ||
			incoming.Steps[i].Notes != existing.Steps[i].Notes ||
			incoming.Steps[i].CounsellorComment != existing.Steps[i].CounsellorComment {
			return existing, fmt.Errorf("cannot change step content")
		}
		if existing.Steps[i].Completed && !incoming.Steps[i].Completed {
			return existing, fmt.Errorf("cannot uncomplete step")
		}
		out.Steps[i].StudentComment = incoming.Steps[i].StudentComment
		out.Steps[i].StudentFileName = incoming.Steps[i].StudentFileName
		out.Steps[i].StudentFileData = incoming.Steps[i].StudentFileData
		out.Steps[i].StudentFileType = incoming.Steps[i].StudentFileType

		if !incoming.Steps[i].Completed {
			continue
		}
		if existing.Steps[i].Completed {
			out.Steps[i].Completed = true
			continue
		}
		if i > 0 && !out.Steps[i-1].Completed {
			return existing, fmt.Errorf("complete steps in order")
		}
		out.Steps[i].Completed = true
	}
	return out, nil
}

func mergeCounselorStepUpdate(existing, incoming models.TreatmentPlanStepsDocument) models.TreatmentPlanStepsDocument {
	normalizeSteps(&existing)
	normalizeSteps(&incoming)
	out := existing
	// Counselor edits: replace titles, notes, recommendations, counsellor comments; preserve student completion & student_comment
	for i := 0; i < 4; i++ {
		out.Steps[i].Title = incoming.Steps[i].Title
		out.Steps[i].Notes = incoming.Steps[i].Notes
		out.Steps[i].CounsellorComment = incoming.Steps[i].CounsellorComment
	}
	out.Recommendations = incoming.Recommendations
	return out
}

// CreateTreatmentPlan — counselor or admin
func CreateTreatmentPlan(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if currentUser.Role != "counselor" && currentUser.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var plan models.TreatmentPlan
	if err := c.BindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if currentUser.Role == "counselor" && plan.CounsellorID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Counsellor mismatch"})
		return
	}

	doc, err := parseStepsDocument(plan.StepsData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid steps_data"})
		return
	}
	normalizeSteps(&doc)
	if len(doc.Steps) != 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "steps_data must contain exactly 4 steps"})
		return
	}

	plan.StepsData, err = mustMarshalSteps(doc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize steps"})
		return
	}

	if plan.Status == "" {
		plan.Status = recomputePlanStatusFromSteps(&doc)
	}

	result := initializers.DB.Create(&plan)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// GetTreatmentPlans returns treatment plans for the logged-in counselor (or all for admin).
func GetTreatmentPlans(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if currentUser.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	baseSQL := `
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name,
			tp.steps_data,
			tp.updated_at
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
	`

	var plans []treatmentPlanListResponse
	var err error

	switch currentUser.Role {
	case "admin":
		err = initializers.DB.Raw(baseSQL + ` ORDER BY tp.id DESC`).Scan(&plans).Error
	case "counselor":
		err = initializers.DB.Raw(baseSQL+` WHERE tp.counsellor_id = ? ORDER BY tp.id DESC`, currentUser.ID).Scan(&plans).Error
	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch treatment plans"})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// GetTreatmentPlansByStudent returns plans for one student.
func GetTreatmentPlansByStudent(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentIDStr := c.Param("studentId")
	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil || studentID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	if currentUser.Role == "student" && currentUser.ID != uint(studentID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var plans []treatmentPlanListResponse

	err = initializers.DB.Raw(`
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name,
			tp.steps_data,
			tp.updated_at
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
		WHERE tp.student_id = ?
		ORDER BY tp.id DESC
	`, uint(studentID)).Scan(&plans).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch treatment plans"})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// GetTreatmentPlanByID returns one plan with steps_data (for report / detail).
func GetTreatmentPlanByID(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idStr := c.Param("id")
	id64, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil || id64 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id"})
		return
	}

	var row treatmentPlanListResponse
	err = initializers.DB.Raw(`
		SELECT 
			tp.id,
			tp.appointment_id,
			tp.counsellor_id,
			tp.student_id,
			tp.title,
			tp.description,
			tp.status,
			student_users.name AS student_name,
			counsellor_users.name AS counsellor_name,
			tp.steps_data,
			tp.updated_at
		FROM treatment_plans tp
		LEFT JOIN users AS student_users ON student_users.id = tp.student_id
		LEFT JOIN users AS counsellor_users ON counsellor_users.id = tp.counsellor_id
		WHERE tp.id = ?
	`, uint(id64)).Scan(&row).Error

	if err != nil || row.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Treatment plan not found"})
		return
	}

	if currentUser.Role == "student" && currentUser.ID != row.StudentID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	if currentUser.Role == "counselor" && currentUser.ID != row.CounsellorID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, row)
}

func DeleteTreatmentPlan(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if currentUser.Role != "counselor" && currentUser.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	id := c.Param("id")
	var existing models.TreatmentPlan
	if err := initializers.DB.First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Treatment plan not found"})
		return
	}
	if currentUser.Role == "counselor" && existing.CounsellorID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := initializers.DB.Delete(&models.TreatmentPlan{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Treatment plan deleted successfully"})
}

func UpdateTreatmentPlan(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser, ok := userVal.(models.User)
	if !ok || currentUser.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := c.Param("id")
	var existingPlan models.TreatmentPlan
	if err := initializers.DB.First(&existingPlan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Treatment plan not found"})
		return
	}

	var body models.TreatmentPlan
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	existingDoc, err := parseStepsDocument(existingPlan.StepsData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stored plan is invalid"})
		return
	}
	normalizeSteps(&existingDoc)

	switch currentUser.Role {
	case "student":
		if currentUser.ID != existingPlan.StudentID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		incomingDoc, err := parseStepsDocument(body.StepsData)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid steps_data"})
			return
		}
		merged, err := mergeStudentStepUpdate(existingDoc, incomingDoc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		existingPlan.Status = recomputePlanStatusFromSteps(&merged)
		raw, err := mustMarshalSteps(merged)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize steps"})
			return
		}
		existingPlan.StepsData = raw

	case "counselor", "admin":
		if currentUser.Role == "counselor" && existingPlan.CounsellorID != currentUser.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		incomingDoc, err := parseStepsDocument(body.StepsData)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid steps_data"})
			return
		}
		normalizeSteps(&incomingDoc)
		if len(incomingDoc.Steps) != 4 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "steps_data must contain exactly 4 steps"})
			return
		}
		merged := mergeCounselorStepUpdate(existingDoc, incomingDoc)
		// preserve completion & student_comment from existing
		for i := 0; i < 4; i++ {
			merged.Steps[i].Completed = existingDoc.Steps[i].Completed
			merged.Steps[i].StudentComment = existingDoc.Steps[i].StudentComment
			merged.Steps[i].StudentFileName = existingDoc.Steps[i].StudentFileName
			merged.Steps[i].StudentFileData = existingDoc.Steps[i].StudentFileData
			merged.Steps[i].StudentFileType = existingDoc.Steps[i].StudentFileType
		}
		if body.Status != "" {
			existingPlan.Status = body.Status
		} else {
			existingPlan.Status = recomputePlanStatusFromSteps(&merged)
		}
		raw, err := mustMarshalSteps(merged)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize steps"})
			return
		}
		existingPlan.StepsData = raw
		existingPlan.Title = body.Title
		existingPlan.Description = body.Description
		if body.AppointmentID != 0 {
			existingPlan.AppointmentID = body.AppointmentID
		}

	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := initializers.DB.Save(&existingPlan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update treatment plan"})
		return
	}

	c.JSON(http.StatusOK, existingPlan)
}