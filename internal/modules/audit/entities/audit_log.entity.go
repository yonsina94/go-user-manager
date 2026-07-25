package entities

import (
	"time"

	"github.com/yonsina94/go-user-manager/internal/modules/enums"
)

type AuditLog struct {
	ID        uint              `gorm:"primaryKey" json:"id"`
	UserID    *uint             `gorm:"index" json:"userId,omitempty"`
	UserEmail string            `gorm:"size:256" json:"userEmail"`
	Action    enums.AuditAction `gorm:"size:100;not null;index" json:"action"`
	Entity    enums.AuditEntity `gorm:"size:100;not null" json:"entity"`
	EntityID  *uint             `json:"entityId,omitempty"`
	Status    enums.AuditStatus `gorm:"size:20;default:'SUCCESS'" json:"status"`
	Method    string            `gorm:"size:10" json:"method"`
	Path      string            `gorm:"size:256" json:"path"`
	Details   string            `gorm:"type:text" json:"details"`
	Payload   string            `gorm:"type:text" json:"payload,omitempty"`
	IPAddress string            `gorm:"size:45" json:"ipAddress"`
	UserAgent string            `gorm:"size:512" json:"userAgent"`
	CreatedAt time.Time         `gorm:"autoCreateTime" json:"createdAt"`
}
