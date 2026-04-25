package models

import (
	"time"

	"gorm.io/gorm"
)

type CounsellorApplication struct {
	gorm.Model
	ID uint `json:"id" gorm:"primaryKey"`

	UserId         uint   `json:"userId"  gorm:"not null"` //linked to registered user
	FullName       string `json:"fullName"  gorm:"not null"`
	Email          string `json:"email"  gorm:"not null"`
	Phone          string `json:"phone"  gorm:"not null"`
	Specialization string `json:"specialization"  gorm:"not null"`
	Qualification  string `json:"qualification"  gorm:"not null"`
	Experience     int    `json:"experience"  gorm:"not null"`
	Workplace      string `json:"workplace"  gorm:"not null"`
	LocationReason string `json:"locationReason"`
	About          string `json:"about"`
	RegistrationID string `json:"registrationId" gorm:"unique;not null"`

	NICFile         string     `json:"nicFile"  gorm:"not null"`
	CertificateFile string     `json:"certificateFile"  gorm:"not null"`
	ProfileImage    string     `json:"profileImage"`
	Status          string     `json:"status" gorm:"type:varchar(20);default:'pending'"` // pending | approved | rejected
	InterviewDate   *time.Time `json:"interviewDate"`
	InterviewMode   string     `json:"interviewMode"`   // online | onsite
	InterviewNote   string     `json:"interviewNote"`   // optional admin instructions
	InterviewStatus string     `json:"interviewStatus"` // unscheduled | scheduled | completed | cancelled
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}
