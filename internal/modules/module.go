package modules

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/middleware"
	"github.com/yonsina94/go-user-manager/internal/modules/audit"
	"github.com/yonsina94/go-user-manager/internal/modules/auth"
	"github.com/yonsina94/go-user-manager/internal/modules/enums"
	"github.com/yonsina94/go-user-manager/internal/modules/user"
	"gorm.io/gorm"
)

func InitModules(db *gorm.DB, lf *logging.LoggerFactory, engine *gin.Engine) {
	rgApi := engine.Group("/api")

	auditService := audit.NewAuditService(db, lf)

	// Servicio de Lista Negra de Tokens JWT (Revocación al cerrar sesión)
	tokenBlacklistService := auth.NewTokenBlacklistService(db, lf)
	middleware.SetTokenBlacklistChecker(func(tokenStr string) bool {
		return tokenBlacklistService.IsTokenInvalidated(context.Background(), tokenStr)
	})

	// Módulo de Usuario (incluye Auth y Perfil)
	user.NewUserController(rgApi.Group("/user"), user.NewUserService(db, lf), auditService, tokenBlacklistService, lf)

	// Módulo de Auditoría (Protegido para Administradores)
	auditGroup := rgApi.Group("/audit-logs", middleware.AuthMiddleware(), middleware.RequireRole(string(enums.ADMIN)))
	audit.NewAuditController(auditGroup, auditService, lf)
}
