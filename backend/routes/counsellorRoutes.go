package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func CounsellorRoutes(r *gin.Engine) {

	// =========== SADHUSHAN'S ROUTES =========== //

	// PROTECTED route - must be logged in
	r.POST("/api/counsellor/apply", middleware.RequireAuth, controllers.ApplyCounsellor)

	r.POST("/api/counsellor/profile-image/:userId", controllers.UploadProfileImage)

	r.DELETE("/api/counsellor/profile-image/:userId", controllers.RemoveProfileImage)

	// PUBLIC route - anyone can view counsellors
	r.GET("/api/counsellor/all", controllers.GetApprovedCounsellors)

	// PUBLIC route -  can view a counsellor's profile
	r.GET("/api/counsellor/profile/:userId", controllers.GetCounsellorProfile)

	// PROTECTED route - must be logged in to update profile
	r.PUT("/api/counsellor/profile/:userId", controllers.UpdateCounsellorProfile)

	// ================ AAISHA'S ROUTES ================ //

	r.GET("/api/counsellor/location/all", middleware.RequireAuth, controllers.GetCounsellorsForLocationAssignment)
	r.GET("/api/counsellor/location/me", middleware.RequireAuth, controllers.GetMyAssignedLocation)
	r.PUT("/api/counsellor/location/:userId", middleware.RequireAuth, controllers.AssignCounsellorLocation)

}
