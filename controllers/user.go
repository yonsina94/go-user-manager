package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/config"
	"github.com/yonsina94/go-user-manager/models"
)

// GetUsers - GET /api/users
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GetUser - GET /api/users/:id
func GetUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// CreateUser - POST /api/users
func CreateUser(c *gin.Context) {
	var input struct {
		Name   string `json:"name" binding:"required"`
		Email  string `json:"email" binding:"required,email"`
		Role   string `json:"role"`
		Active *bool  `json:"active"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := "Usuario"
	if input.Role != "" {
		role = input.Role
	}
	active := true
	if input.Active != nil {
		active = *input.Active
	}

	user := models.User{
		Name:   input.Name,
		Email:  input.Email,
		Role:   role,
		Active: active,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// UpdateUser - PUT /api/users/:id
func UpdateUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	var input struct {
		Name   string `json:"name"`
		Email  string `json:"email" binding:"omitempty,email"`
		Role   string `json:"role"`
		Active *bool  `json:"active"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Email != "" {
		updates["email"] = input.Email
	}
	if input.Role != "" {
		updates["role"] = input.Role
	}
	if input.Active != nil {
		updates["active"] = *input.Active
	}

	if err := config.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteUser - DELETE /api/users/:id
func DeleteUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")

	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuario eliminado correctamente"})
}
