package enums

type UserRole string

const (
	USER  UserRole = "Usuario"
	ADMIN UserRole = "Administrador"
)

type UserStatus string

const (
	ACTIVE   UserStatus = "Activo"
	INACTIVE UserStatus = "Inactivo"
)

func (ur UserRole) String() string {
	return string(ur)
}

func (us UserStatus) String() string {
	return string(us)
}

func UserRoleFromString(s string) UserRole {
	switch s {
	case "Usuario":
		return USER
	case "Administrador":
		return ADMIN
	default:
		return USER
	}
}

func UserStatusFromString(s string) UserStatus {
	switch s {
	case "Activo":
		return ACTIVE
	case "Inactivo":
		return INACTIVE
	default:
		return ACTIVE
	}
}
