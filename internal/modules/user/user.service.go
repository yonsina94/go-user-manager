package user

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log/slog"
	"time"

	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/modules/enums"
	"github.com/yonsina94/go-user-manager/internal/modules/user/entities"
	"github.com/yonsina94/go-user-manager/pkg/query"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db     *gorm.DB
	repo   gorm.Interface[entities.User]
	logger *slog.Logger
}

func NewUserService(db *gorm.DB, lf *logging.LoggerFactory) *UserService {
	return &UserService{
		db:   db,
		repo: gorm.G[entities.User](db),
		logger: lf.CreateLogger(logging.ComponentDetails{
			Name:        "User Service",
			Type:        "service",
			Description: "User Service",
		}),
	}
}

func (u *UserService) Create(ctx context.Context, user *entities.User) error {
	// Verificar si el usuario ya existe
	u.logger.DebugContext(ctx, "Validating user existence", slog.String("username", user.Username), slog.String("email", user.Email))
	amount, err := u.repo.Where("username = ? or email = ?", user.Username, user.Email).Count(ctx, "id")
	if err != nil {
		u.logger.ErrorContext(ctx, "Error validating user existence", slog.Any("error", err))
		return err
	}

	if amount > 0 {
		u.logger.ErrorContext(ctx, "User already exists", slog.String("username", user.Username), slog.String("email", user.Email))
		return gorm.ErrDuplicatedKey
	}

	// Hashear la contraseña usando bcrypt antes de guardar
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error hashing password during creation", slog.Any("error", err))
		return err
	}
	user.Password = string(hashedPassword)

	err = u.repo.Create(ctx, user)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error inserting user to database", slog.Any("error", err))
		return err
	}

	u.logger.InfoContext(ctx, "User created successfully", slog.Uint64("id", uint64(user.ID)))
	return nil
}

func (u *UserService) FindAll(ctx context.Context) ([]entities.User, error) {
	u.logger.DebugContext(ctx, "Retrieving all users")
	users, err := u.repo.Find(ctx)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error retrieving all users", slog.Any("error", err))
		return nil, err
	}
	u.logger.DebugContext(ctx, "Successfully retrieved all users", slog.Int("count", len(users)))
	return users, nil
}

func (u *UserService) FindByID(ctx context.Context, id uint) (entities.User, error) {
	u.logger.DebugContext(ctx, "Retrieving user by ID", slog.Uint64("id", uint64(id)))
	user, err := u.repo.Where("id = ?", id).First(ctx)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error retrieving user by ID", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return entities.User{}, err
	}
	return user, nil
}

func (u *UserService) FindByUsername(ctx context.Context, username string) (entities.User, error) {
	u.logger.DebugContext(ctx, "Retrieving user by username", slog.String("username", username))
	user, err := u.repo.Where("username = ?", username).First(ctx)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error retrieving user by username", slog.String("username", username), slog.Any("error", err))
		return entities.User{}, err
	}
	return user, nil
}

func (u *UserService) FindByEmail(ctx context.Context, email string) (entities.User, error) {
	u.logger.DebugContext(ctx, "Retrieving user by email", slog.String("email", email))
	user, err := u.repo.Where("email = ?", email).First(ctx)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error retrieving user by email", slog.String("email", email), slog.Any("error", err))
		return entities.User{}, err
	}
	return user, nil
}

func (u *UserService) Update(ctx context.Context, id uint, user *entities.User) (bool, error) {
	u.logger.DebugContext(ctx, "Updating user entity", slog.Uint64("id", uint64(id)))
	r, err := u.repo.Where("id = ?", id).Updates(ctx, *user)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating user entity", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "User entity updated successfully", slog.Uint64("id", uint64(id)))
	return true, nil
}

func (u *UserService) Delete(ctx context.Context, id uint) (bool, error) {
	u.logger.DebugContext(ctx, "Deleting user", slog.Uint64("id", uint64(id)))
	r, err := u.repo.Where("id = ?", id).Delete(ctx)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error deleting user", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to delete not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "User deleted successfully", slog.Uint64("id", uint64(id)))
	return true, nil
}

func (u *UserService) UpdatePassword(ctx context.Context, id uint, plainPassword string) (bool, error) {
	u.logger.DebugContext(ctx, "Updating password for user", slog.Uint64("id", uint64(id)))
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		u.logger.ErrorContext(ctx, "Error hashing new password", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{Password: string(hashedPassword)})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating password in database", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update password not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Password updated successfully", slog.Uint64("id", uint64(id)))
	return r > 0, nil
}

func (u *UserService) UpdateProfile(ctx context.Context, id uint, name, lastName string) (bool, error) {
	u.logger.DebugContext(ctx, "Updating profile details for user", slog.Uint64("id", uint64(id)))
	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{Name: name, LastName: lastName})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating profile in database", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update profile not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Profile updated successfully", slog.Uint64("id", uint64(id)))
	return r > 0, nil
}

func (u *UserService) UpdateAvatar(ctx context.Context, id uint, avatarUrl string) (bool, error) {
	u.logger.DebugContext(ctx, "Updating avatar for user", slog.Uint64("id", uint64(id)))

	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{AvatarUrl: sql.NullString{String: avatarUrl, Valid: true}})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating avatar in database")
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update avatar not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Avatar updated successfully", slog.Uint64("id", uint64(id)))

	return r > 0, nil
}

func (u *UserService) UpdateEmail(ctx context.Context, id uint, email string) (bool, error) {
	u.logger.DebugContext(ctx, "Updating email for user", slog.Uint64("id", uint64(id)), slog.String("new_email", email))
	amount, err := u.repo.Where("email = ? and id != ?", email, id).Count(ctx, "id")
	if err != nil {
		u.logger.ErrorContext(ctx, "Error checking duplicate email during update", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}
	if amount > 0 {
		u.logger.WarnContext(ctx, "Duplicate email check failed for user", slog.Uint64("id", uint64(id)), slog.String("email", email))
		return false, gorm.ErrDuplicatedKey
	}

	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{Email: email})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating email in database", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update email not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Email updated successfully", slog.Uint64("id", uint64(id)))
	return r > 0, nil
}

func (u *UserService) UpdateUsername(ctx context.Context, id uint, username string) (bool, error) {
	u.logger.DebugContext(ctx, "Updating username for user", slog.Uint64("id", uint64(id)), slog.String("new_username", username))
	amount, err := u.repo.Where("username = ? and id != ?", username, id).Count(ctx, "id")
	if err != nil {
		u.logger.ErrorContext(ctx, "Error checking duplicate username during update", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}
	if amount > 0 {
		u.logger.WarnContext(ctx, "Duplicate username check failed for user", slog.Uint64("id", uint64(id)), slog.String("username", username))
		return false, gorm.ErrDuplicatedKey
	}

	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{Username: username})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating username in database", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update username not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Username updated successfully", slog.Uint64("id", uint64(id)))
	return r > 0, nil
}

func (u *UserService) UpdateRole(ctx context.Context, id uint, role enums.UserRole) (bool, error) {
	u.logger.DebugContext(ctx, "Updating role for user", slog.Uint64("id", uint64(id)), slog.String("new_role", string(role)))
	r, err := u.repo.Where("id = ?", id).Updates(ctx, entities.User{Role: role})
	if err != nil {
		u.logger.ErrorContext(ctx, "Error updating role in database", slog.Uint64("id", uint64(id)), slog.Any("error", err))
		return false, err
	}

	if r == 0 {
		u.logger.WarnContext(ctx, "User to update role not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Role updated successfully", slog.Uint64("id", uint64(id)), slog.String("role", string(role)))
	return r > 0, nil
}

func (u *UserService) UpdateStatus(ctx context.Context, id uint, active bool) (bool, error) {
	u.logger.DebugContext(ctx, "Updating active status for user", slog.Uint64("id", uint64(id)), slog.Bool("active", active))
	result := u.db.WithContext(ctx).Model(&entities.User{}).Where("id = ?", id).Update("active", active)
	if result.Error != nil {
		u.logger.ErrorContext(ctx, "Error updating active status in database", slog.Uint64("id", uint64(id)), slog.Any("error", result.Error))
		return false, result.Error
	}

	if result.RowsAffected == 0 {
		u.logger.WarnContext(ctx, "User to update status not found", slog.Uint64("id", uint64(id)))
		return false, nil
	}

	u.logger.InfoContext(ctx, "Active status updated successfully", slog.Uint64("id", uint64(id)), slog.Bool("active", active))
	return result.RowsAffected > 0, nil
}

func (u *UserService) FindWithFilter(ctx context.Context, filter *query.QueryFilter) ([]entities.User, int64, error) {
	u.logger.DebugContext(ctx, "Executing FindWithFilter")

	if u.db == nil {
		return nil, 0, nil
	}

	var total int64
	countDb := u.db.WithContext(ctx).Model(&entities.User{})
	if filter != nil {
		if len(filter.Filters) > 0 || (filter.Search != nil && (len(filter.Search.And) > 0 || len(filter.Search.Or) > 0)) {
			countFilter := *filter
			countFilter.Pagination = nil
			countFilter.OrderBy = nil
			countDb = countDb.Scopes(query.ApplyQueryFilter(&countFilter))
		}
	}

	if err := countDb.Count(&total).Error; err != nil {
		u.logger.ErrorContext(ctx, "Error counting users for query filter", slog.Any("error", err))
		return nil, 0, err
	}

	var users []entities.User
	err := u.db.WithContext(ctx).
		Scopes(query.ApplyQueryFilter(filter)).
		Find(&users).Error

	if err != nil {
		u.logger.ErrorContext(ctx, "Error executing FindWithFilter", slog.Any("error", err))
		return nil, 0, err
	}

	u.logger.DebugContext(ctx, "FindWithFilter completed successfully", slog.Int64("total", total), slog.Int("count", len(users)))
	return users, total, nil
}

func generateSecureToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (u *UserService) CreatePasswordResetToken(ctx context.Context, email, ipAddress, userAgent string) (*entities.PasswordResetToken, error) {
	u.logger.DebugContext(ctx, "Creating password reset token for email", slog.String("email", email))

	user, err := u.FindByEmail(ctx, email)
	if err != nil {
		u.logger.WarnContext(ctx, "User not found for password reset request", slog.String("email", email))
		return nil, gorm.ErrRecordNotFound
	}

	tokenStr, err := generateSecureToken()
	if err != nil {
		u.logger.ErrorContext(ctx, "Error generating secure reset token", slog.Any("error", err))
		return nil, err
	}

	resetRecord := entities.PasswordResetToken{
		UserID:    user.ID,
		Token:     tokenStr,
		ExpiresAt: time.Now().Add(15 * time.Minute),
		Used:      false,
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}

	if err := u.db.WithContext(ctx).Create(&resetRecord).Error; err != nil {
		u.logger.ErrorContext(ctx, "Error storing password reset token in database", slog.Any("error", err))
		return nil, err
	}

	u.logger.InfoContext(ctx, "Password reset token created successfully", slog.Uint64("userId", uint64(user.ID)), slog.String("token", tokenStr))
	return &resetRecord, nil
}

func (u *UserService) ResetPasswordWithToken(ctx context.Context, tokenStr, newPassword string) (bool, error) {
	u.logger.DebugContext(ctx, "Attempting password reset with token")

	var resetRecord entities.PasswordResetToken
	err := u.db.WithContext(ctx).
		Where("token = ? AND used = ? AND expires_at > ?", tokenStr, false, time.Now()).
		First(&resetRecord).Error

	if err != nil {
		u.logger.WarnContext(ctx, "Invalid or expired password reset token supplied")
		return false, fmt.Errorf("token de recuperación inválido o expirado")
	}

	// Actualizar la contraseña del usuario
	if _, err := u.UpdatePassword(ctx, resetRecord.UserID, newPassword); err != nil {
		u.logger.ErrorContext(ctx, "Error updating password for reset token", slog.Any("error", err))
		return false, err
	}

	// Marcar token como utilizado (auditoría)
	now := time.Now()
	u.db.WithContext(ctx).Model(&resetRecord).Updates(map[string]any{
		"used":    true,
		"used_at": &now,
	})

	u.logger.InfoContext(ctx, "Password reset successfully executed with token", slog.Uint64("userId", uint64(resetRecord.UserID)))
	return true, nil
}
