package modules

import (
	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/middleware"
	"github.com/yonsina94/go-user-manager/internal/modules/audit"
	"github.com/yonsina94/go-user-manager/internal/modules/enums"
	"github.com/yonsina94/go-user-manager/internal/modules/user"
	"gorm.io/gorm"
)

func InitModules(db *gorm.DB, lf *logging.LoggerFactory, engine *gin.Engine) {
	rgApi := engine.Group("/api")

	auditService := audit.NewAuditService(db, lf)

	// Módulo de Usuario (incluye Auth y Perfil)
	user.NewUserController(rgApi.Group("/user"), user.NewUserService(db, lf), auditService, lf)

	// Módulo de Auditoría (Protegido para Administradores)
	auditGroup := rgApi.Group("/audit-logs", middleware.AuthMiddleware(), middleware.RequireRole(string(enums.ADMIN)))
	audit.NewAuditController(auditGroup, auditService, lf)
}
