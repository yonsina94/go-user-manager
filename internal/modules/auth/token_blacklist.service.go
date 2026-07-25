package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/modules/auth/entities"
	"gorm.io/gorm"
)

type TokenBlacklistService struct {
	db     *gorm.DB
	logger *slog.Logger
}

func NewTokenBlacklistService(db *gorm.DB, lf *logging.LoggerFactory) *TokenBlacklistService {
	return &TokenBlacklistService{
		db: db,
		logger: lf.CreateLogger(logging.ComponentDetails{
			Name:        "Token Blacklist Service",
			Type:        "service",
			Description: "JWT Token Revocation & Blacklist Management",
		}),
	}
}

func HashToken(tokenStr string) string {
	hash := sha256.Sum256([]byte(tokenStr))
	return hex.EncodeToString(hash[:])
}

// InvalidateToken calcula el hash del token y lo almacena con su expiración.
func (s *TokenBlacklistService) InvalidateToken(ctx context.Context, tokenStr string, secret string) error {
	s.logger.DebugContext(ctx, "Attempting to invalidate token")

	// Parsear el token sin validar la firma para obtener su expiración (o usando la clave secreta)
	token, _, err := jwt.NewParser().ParseUnverified(tokenStr, jwt.MapClaims{})
	var expiresAt time.Time

	if err == nil {
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if exp, ok := claims["exp"].(float64); ok {
				expiresAt = time.Unix(int64(exp), 0)
			}
		}
	}

	// Si no se obtuvo una expiración válida, usar expiración por defecto de 24 horas
	if expiresAt.IsZero() || expiresAt.Before(time.Now()) {
		expiresAt = time.Now().Add(24 * time.Hour)
	}

	tokenHash := HashToken(tokenStr)
	record := entities.InvalidatedToken{
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	}

	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		s.logger.ErrorContext(ctx, "Error storing invalidated token in database", slog.Any("error", err))
		return fmt.Errorf("error inhabilitando el token: %w", err)
	}

	s.logger.InfoContext(ctx, "Token successfully invalidated and blacklisted", slog.Time("expiresAt", expiresAt))
	return nil
}

// IsTokenInvalidated verifica si el hash del token existe en la lista negra y aún no ha expirado.
func (s *TokenBlacklistService) IsTokenInvalidated(ctx context.Context, tokenStr string) bool {
	tokenHash := HashToken(tokenStr)
	var count int64

	err := s.db.WithContext(ctx).Model(&entities.InvalidatedToken{}).
		Where("token_hash = ? AND expires_at > ?", tokenHash, time.Now()).
		Count(&count).Error

	if err != nil {
		s.logger.ErrorContext(ctx, "Error checking token blacklist status", slog.Any("error", err))
		return false
	}

	return count > 0
}
