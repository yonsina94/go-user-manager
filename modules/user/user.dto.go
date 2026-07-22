package user

import (
	"github.com/yonsina94/go-user-manager/modules/enums"
	"github.com/yonsina94/go-user-manager/modules/user/entities"
)

// UserDTO representa los datos del usuario expuestos al frontend (sin contraseña).
type UserDTO struct {
	ID        uint           `json:"id"`
	Name      string         `json:"name"`
	LastName  string         `json:"lastName"`
	Username  string         `json:"username"`
	Email     string         `json:"email"`
	Role      enums.UserRole `json:"role"`
	Active    bool           `json:"active"`
	CreatedAt string         `json:"createdAt"`
	UpdatedAt string         `json:"updatedAt"`
}

// RegisterRequest representa los datos de entrada para registrar un usuario.
type RegisterRequest struct {
	Name     string         `json:"name" binding:"required"`
	LastName string         `json:"lastName" binding:"required"`
	Username string         `json:"username" binding:"required"`
	Email    string         `json:"email" binding:"required,email"`
	Password string         `json:"password" binding:"required,min=6"`
	Role     enums.UserRole `json:"role" binding:"required"`
}

// LoginRequest representa las credenciales enviadas por el usuario para iniciar sesión.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse representa la respuesta exitosa del login incluyendo los datos del usuario.
type LoginResponse struct {
	User  UserDTO `json:"user"`
	Token string  `json:"token"`
}

// ToUserDTO convierte una entidad User en su DTO correspondiente.
func ToUserDTO(u entities.User) UserDTO {
	return UserDTO{
		ID:        u.ID,
		Name:      u.Name,
		LastName:  u.LastName,
		Username:  u.Username,
		Email:     u.Email,
		Role:      u.Role,
		Active:    u.Active,
		CreatedAt: u.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: u.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// ToUserDTOs convierte una lista de entidades User en una lista de DTOs.
func ToUserDTOs(users []entities.User) []UserDTO {
	dtos := make([]UserDTO, len(users))
	for i, u := range users {
		dtos[i] = ToUserDTO(u)
	}
	return dtos
}

// UpdateProfileRequest representa los datos para actualizar el perfil.
type UpdateProfileRequest struct {
	Name     string `json:"name" binding:"required"`
	LastName string `json:"lastName" binding:"required"`
}

// UpdatePasswordRequest representa los datos para actualizar la contraseña del propio usuario.
type UpdatePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

// ForgotPasswordRequest representa los datos para iniciar la recuperación de contraseña.
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest representa los datos para restablecer la contraseña usando un token.
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// ChangePasswordRequest representa una petición directa de cambio de contraseña.
type ChangePasswordRequest struct {
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// ChangeEmailRequest representa los datos para cambiar el correo electrónico.
type ChangeEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ChangeUsernameRequest representa los datos para cambiar el nombre de usuario.
type ChangeUsernameRequest struct {
	Username string `json:"username" binding:"required"`
}

// ChangeRoleRequest representa los datos para cambiar el rol de un usuario (Admin).
type ChangeRoleRequest struct {
	UserID uint           `json:"userId" binding:"required"`
	Role   enums.UserRole `json:"role" binding:"required"`
}

// ChangeStatusRequest representa los datos para cambiar el estado activo de un usuario (Admin).
type ChangeStatusRequest struct {
	UserID uint `json:"userId" binding:"required"`
	Active bool `json:"active"`
}

// AdminUpdateUserRequest representa los datos para que un Admin actualice un usuario.
type AdminUpdateUserRequest struct {
	Name     string         `json:"name" binding:"required"`
	LastName string         `json:"lastName" binding:"required"`
	Email    string         `json:"email" binding:"required,email"`
	Role     enums.UserRole `json:"role" binding:"required"`
	Active   bool           `json:"active"`
}
