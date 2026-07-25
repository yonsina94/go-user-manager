package entities

import (
	"time"

	"gorm.io/gorm"
)

// InvalidatedToken representa un token JWT revocado/invalidado tras un cierre de sesión.
type InvalidatedToken struct {
	gorm.Model
	TokenHash string    `gorm:"column:token_hash;size:256;uniqueIndex;not null" json:"tokenHash"`
	ExpiresAt time.Time `gorm:"column:expires_at;not null;index" json:"expiresAt"`
}
