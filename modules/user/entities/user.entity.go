package entities

import (
	"github.com/yonsina94/go-user-manager/modules/enums"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string         `gorm:"not null" json:"name"`
	LastName string         `gorm:"not null" json:"last_name"`
	Username string         `gorm:"column:username;size:256;unique;not null" json:"username"`
	Password string         `gorm:"not null" json:"-"`
	Email    string         `gorm:"column:email;size:256;unique;not null" json:"email"`
	Role     enums.UserRole `gorm:"default:'Usuario'" json:"role"`
	Active   bool           `gorm:"default:true" json:"active"`
}

// ComparePassword compara la contraseña plana contra el hash almacenado en el usuario
func (u *User) ComparePassword(plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(plainPassword))
	return err == nil
}

