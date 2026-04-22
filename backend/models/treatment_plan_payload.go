package models

// TreatmentPlanStepsDocument is stored as JSON in TreatmentPlan.StepsData (PostgreSQL jsonb).
type TreatmentPlanStepsDocument struct {
	Recommendations TreatmentPlanRecommendations `json:"recommendations"`
	Steps           []TreatmentPlanStepEntry     `json:"steps"`
}

type TreatmentPlanRecommendations struct {
	DailyRoutine     string `json:"dailyRoutine"`
	ReadingMaterials string `json:"readingMaterials"`
	ExercisePlan     string `json:"exercisePlan"`
}

type TreatmentPlanStepEntry struct {
	Title             string `json:"title"`
	Notes             string `json:"notes"`
	Completed         bool   `json:"completed"`
	StudentComment    string `json:"student_comment"`
	StudentFileName   string `json:"student_file_name"`
	StudentFileData   string `json:"student_file_data"`
	StudentFileType   string `json:"student_file_type"`
	CounsellorComment string `json:"counsellor_comment"`
}