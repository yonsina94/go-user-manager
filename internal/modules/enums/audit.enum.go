package enums

type AuditAction string

const (
	AuditActionUserLogin       AuditAction = "USER_LOGIN"
	AuditActionUserLoginFailed AuditAction = "USER_LOGIN_FAILED"
	AuditActionUserCreated     AuditAction = "USER_CREATED"
	AuditActionUserUpdated     AuditAction = "USER_UPDATED"
	AuditActionUserDeleted     AuditAction = "USER_DELETED"
	AuditActionAvatarUploaded  AuditAction = "AVATAR_UPLOADED"
	AuditActionPasswordChanged AuditAction = "PASSWORD_CHANGED"
	AuditActionUserExported    AuditAction = "USER_EXPORTED"
	AuditActionUserLogout      AuditAction = "USER_LOGOUT"
)

type AuditEntity string

const (
	AuditEntityAuth    AuditEntity = "Auth"
	AuditEntityUser    AuditEntity = "User"
	AuditEntityProfile AuditEntity = "Profile"
)

type AuditStatus string

const (
	AuditStatusSuccess AuditStatus = "SUCCESS"
	AuditStatusFailed  AuditStatus = "FAILED"
)

func (a AuditAction) String() string {
	return string(a)
}

func (e AuditEntity) String() string {
	return string(e)
}

func (s AuditStatus) String() string {
	return string(s)
}
