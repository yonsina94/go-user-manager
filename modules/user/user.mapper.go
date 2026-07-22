package user

import (
	"github.com/yonsina94/go-user-manager/modules/commons/transformer"
	"github.com/yonsina94/go-user-manager/modules/user/entities"
)

// UserMapper es el transformador sin estado para la entidad User y su DTO.
type UserMapper struct{}

// NewUserMapper crea una nueva instancia de UserMapper que implementa la interfaz transformer.Transformer.
func NewUserMapper() transformer.Transformer[entities.User, UserDTO] {
	return &UserMapper{}
}

// ToDTO convierte una entidad User en su DTO correspondiente.
func (UserMapper) ToDTO(u entities.User) UserDTO {
	return ToUserDTO(u)
}

// ToEntity convierte un UserDTO en su entidad User correspondiente.
func (UserMapper) ToEntity(d UserDTO) entities.User {
	return entities.User{
		Name:     d.Name,
		LastName: d.LastName,
		Username: d.Username,
		Email:    d.Email,
		Role:     d.Role,
		Active:   d.Active,
	}
}
