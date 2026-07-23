package entities

import (
	"time"

	"gorm.io/gorm"
)

// PasswordResetToken representa un token único de recuperación de contraseña con registro de auditoría.
type PasswordResetToken struct {
	gorm.Model
	UserID    uint       `gorm:"not null;index" json:"userId"`
	User      User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Token     string     `gorm:"type:varchar(255);not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time  `gorm:"not null;index" json:"expiresAt"`
	Used      bool       `gorm:"default:false;not null;index" json:"used"`
	UsedAt    *time.Time `json:"usedAt,omitempty"`
	IPAddress string     `gorm:"type:varchar(45)" json:"ipAddress"`
	UserAgent string     `gorm:"type:text" json:"userAgent"`
}
