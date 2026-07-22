package user

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/dto"
	"github.com/yonsina94/go-user-manager/middleware"
	"github.com/yonsina94/go-user-manager/modules/commons/transformer"
	"github.com/yonsina94/go-user-manager/modules/enums"
	"github.com/yonsina94/go-user-manager/modules/user/entities"
	"github.com/yonsina94/go-user-manager/pkg/query"
)

type UserController struct {
	gr      *gin.RouterGroup
	service *UserService
	mapper  transformer.Transformer[entities.User, UserDTO]
}

func NewUserController(router *gin.RouterGroup, service *UserService) *UserController {
	uc := &UserController{
		gr:      router,
		service: service,
		mapper:  NewUserMapper(),
	}

	// Rutas Públicas
	uc.gr.POST("/register", uc.register)
	uc.gr.POST("/login", uc.login)
	uc.gr.POST("/forgot-password", uc.forgotPassword)
	uc.gr.POST("/reset-password", uc.resetPassword)

	// Rutas Protegidas (Requieren Auth)
	protected := uc.gr.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/logout", uc.logout)
		protected.GET("/profile", uc.profile)
		protected.PUT("/profile", uc.updateProfile)
		protected.PUT("/password", uc.updatePassword)
		protected.PUT("/password-change", uc.changePassword)
		protected.PUT("/email", uc.changeEmail)
		protected.PUT("/username", uc.changeUsername)
		protected.DELETE("/account", uc.deleteAccount)
		protected.GET("/:id", uc.getUser)
	}

	// Rutas de Administrador (Requieren Auth y rol de Administrador)
	adminOnly := protected.Group("")
	adminOnly.Use(middleware.RequireRole(string(enums.ADMIN)))
	{
		adminOnly.PUT("/role", uc.changeRole)
		adminOnly.PUT("/status", uc.changeStatus)
		adminOnly.GET("/users", uc.getUsers)
		adminOnly.POST("/search", uc.searchUsers)
		adminOnly.PUT("/:id", uc.updateUserByAdmin)
		adminOnly.DELETE("/:id", uc.deleteUserByAdmin)
	}

	return uc
}

// Helpers para respuestas estandarizadas
func (u *UserController) sendSuccess(c *gin.Context, status int, data any, message string) {
	c.JSON(status, dto.NewSuccessResponse(data, message))
}

func (u *UserController) sendError(c *gin.Context, status int, err error, message string) {
	var errStr string
	if err != nil {
		errStr = err.Error()
		// Loguear el error con ErrorContext para que slog capture el trace_id automáticamente en los logs del backend
		slog.ErrorContext(c.Request.Context(), message, slog.String("error", errStr))
	}
	c.JSON(status, dto.NewErrorResponse(errStr, message))
}

func (u *UserController) register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de registro inválidos")
		return
	}

	userEntity := entities.User{
		Name:     req.Name,
		LastName: req.LastName,
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password, // Se hasheará en el servicio
		Role:     req.Role,
	}

	if err := u.service.Create(c.Request.Context(), &userEntity); err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al registrar el usuario")
		return
	}

	userDTO := u.mapper.ToDTO(userEntity)
	u.sendSuccess(c, http.StatusCreated, userDTO, "Usuario registrado exitosamente")
}

func (u *UserController) login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de login inválidos")
		return
	}

	userEntity, err := u.service.FindByUsername(c.Request.Context(), req.Username)
	if err != nil {
		u.sendError(c, http.StatusUnauthorized, err, "Credenciales incorrectas")
		return
	}

	// Comparar la contraseña plana contra el hash almacenado
	if !userEntity.ComparePassword(req.Password) {
		u.sendError(c, http.StatusUnauthorized, nil, "Credenciales incorrectas")
		return
	}

	// Generar token JWT real
	token, err := middleware.GenerateToken(userEntity.ID, string(userEntity.Role))
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al generar token de sesión")
		return
	}

	userDTO := u.mapper.ToDTO(userEntity)
	u.sendSuccess(c, http.StatusOK, LoginResponse{
		User:  userDTO,
		Token: token,
	}, "Inicio de sesión exitoso")
}

func (u *UserController) logout(c *gin.Context) {
	u.sendSuccess(c, http.StatusOK, nil, "Cierre de sesión exitoso")
}

func (u *UserController) profile(c *gin.Context) {
	userID, _ := c.Get("userID")
	user, err := u.service.FindByID(c.Request.Context(), userID.(uint))
	if err != nil {
		u.sendError(c, http.StatusNotFound, err, "Usuario no encontrado")
		return
	}
	u.sendSuccess(c, http.StatusOK, u.mapper.ToDTO(user), "Perfil obtenido exitosamente")
}

func (u *UserController) updateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de perfil inválidos")
		return
	}

	_, err := u.service.UpdateProfile(c.Request.Context(), userID.(uint), req.Name, req.LastName)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al actualizar perfil")
		return
	}

	user, _ := u.service.FindByID(c.Request.Context(), userID.(uint))
	u.sendSuccess(c, http.StatusOK, u.mapper.ToDTO(user), "Perfil actualizado exitosamente")
}

func (u *UserController) updatePassword(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de contraseña inválidos")
		return
	}

	user, err := u.service.FindByID(c.Request.Context(), userID.(uint))
	if err != nil {
		u.sendError(c, http.StatusNotFound, err, "Usuario no encontrado")
		return
	}

	if !user.ComparePassword(req.CurrentPassword) {
		u.sendError(c, http.StatusBadRequest, nil, "Contraseña actual incorrecta")
		return
	}

	_, err = u.service.UpdatePassword(c.Request.Context(), userID.(uint), req.NewPassword)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al actualizar contraseña")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Contraseña actualizada exitosamente")
}

func (u *UserController) deleteAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	_, err := u.service.Delete(c.Request.Context(), userID.(uint))
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al eliminar cuenta")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Cuenta eliminada exitosamente")
}

func (u *UserController) forgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de correo inválidos")
		return
	}

	_, err := u.service.repo.Where("email = ?", req.Email).First(c.Request.Context())
	if err != nil {
		u.sendError(c, http.StatusNotFound, err, "No existe una cuenta registrada con este correo electrónico")
		return
	}

	dummyRecoveryToken := "rec-token-12345"
	u.sendSuccess(c, http.StatusOK, gin.H{
		"token": dummyRecoveryToken,
	}, "Correo de recuperación enviado exitosamente")
}

func (u *UserController) resetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de restablecimiento inválidos")
		return
	}

	if req.Token != "rec-token-12345" {
		u.sendError(c, http.StatusBadRequest, nil, "Token de recuperación inválido o expirado")
		return
	}

	users, err := u.service.FindAll(c.Request.Context())
	if err != nil || len(users) == 0 {
		u.sendError(c, http.StatusInternalServerError, err, "No hay usuarios registrados")
		return
	}

	_, err = u.service.UpdatePassword(c.Request.Context(), users[0].ID, req.NewPassword)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al restablecer contraseña")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Contraseña restablecida exitosamente")
}

func (u *UserController) changePassword(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de cambio de contraseña inválidos")
		return
	}

	_, err := u.service.UpdatePassword(c.Request.Context(), userID.(uint), req.NewPassword)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al cambiar contraseña")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Contraseña cambiada exitosamente")
}

func (u *UserController) changeEmail(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req ChangeEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de correo inválidos")
		return
	}

	_, err := u.service.UpdateEmail(c.Request.Context(), userID.(uint), req.Email)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al cambiar correo electrónico")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Correo electrónico cambiado exitosamente")
}

func (u *UserController) changeUsername(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req ChangeUsernameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de usuario inválidos")
		return
	}

	_, err := u.service.UpdateUsername(c.Request.Context(), userID.(uint), req.Username)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al cambiar nombre de usuario")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Nombre de usuario cambiado exitosamente")
}

func (u *UserController) changeRole(c *gin.Context) {
	var req ChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de rol inválidos")
		return
	}

	_, err := u.service.UpdateRole(c.Request.Context(), req.UserID, req.Role)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al cambiar rol del usuario")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Rol cambiado exitosamente")
}

func (u *UserController) changeStatus(c *gin.Context) {
	var req ChangeStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de estado inválidos")
		return
	}

	_, err := u.service.UpdateStatus(c.Request.Context(), req.UserID, req.Active)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al cambiar estado del usuario")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Estado de usuario cambiado exitosamente")
}

func (u *UserController) getUsers(c *gin.Context) {
	users, err := u.service.FindAll(c.Request.Context())
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al obtener la lista de usuarios")
		return
	}

	usersDTO := transformer.MapSliceToDTO(u.mapper, users)
	u.sendSuccess(c, http.StatusOK, usersDTO, "Usuarios obtenidos exitosamente")
}

func (u *UserController) getUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		u.sendError(c, http.StatusBadRequest, err, "ID de usuario inválido")
		return
	}

	authUserID, _ := c.Get("userID")
	authUserRole, _ := c.Get("userRole")
	if authUserRole != string(enums.ADMIN) && authUserID.(uint) != uint(id) {
		u.sendError(c, http.StatusForbidden, nil, "No tienes permisos para ver este perfil")
		return
	}

	user, err := u.service.FindByID(c.Request.Context(), uint(id))
	if err != nil {
		u.sendError(c, http.StatusNotFound, err, "Usuario no encontrado")
		return
	}

	userDTO := u.mapper.ToDTO(user)
	u.sendSuccess(c, http.StatusOK, userDTO, "Usuario obtenido exitosamente")
}

func (u *UserController) updateUserByAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		u.sendError(c, http.StatusBadRequest, err, "ID de usuario inválido")
		return
	}

	var req AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Datos de usuario inválidos")
		return
	}

	userEntity := entities.User{
		Name:     req.Name,
		LastName: req.LastName,
		Email:    req.Email,
		Role:     req.Role,
		Active:   req.Active,
	}

	_, err = u.service.Update(c.Request.Context(), uint(id), &userEntity)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al actualizar usuario")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Usuario actualizado exitosamente")
}

func (u *UserController) deleteUserByAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		u.sendError(c, http.StatusBadRequest, err, "ID de usuario inválido")
		return
	}

	_, err = u.service.Delete(c.Request.Context(), uint(id))
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al eliminar usuario")
		return
	}

	u.sendSuccess(c, http.StatusOK, nil, "Usuario eliminado exitosamente")
}

func (u *UserController) searchUsers(c *gin.Context) {
	var filter query.QueryFilter
	if err := c.ShouldBindJSON(&filter); err != nil {
		u.sendError(c, http.StatusBadRequest, err, "Filtro de búsqueda inválido")
		return
	}

	users, total, err := u.service.FindWithFilter(c.Request.Context(), &filter)
	if err != nil {
		u.sendError(c, http.StatusInternalServerError, err, "Error al ejecutar la búsqueda de usuarios")
		return
	}

	usersDTO := transformer.MapSliceToDTO(u.mapper, users)
	u.sendSuccess(c, http.StatusOK, gin.H{
		"items": usersDTO,
		"total": total,
	}, "Búsqueda ejecutada exitosamente")
}
