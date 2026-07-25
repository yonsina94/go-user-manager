package audit_test

import (
	"testing"

	"github.com/yonsina94/go-user-manager/internal/modules/audit/entities"
	"github.com/yonsina94/go-user-manager/internal/modules/enums"
)

// Table-driven test for Audit Action and Status classification
func TestAuditLogClassifications(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		action         enums.AuditAction
		status         enums.AuditStatus
		expectedAction string
		expectedStatus string
	}{
		{
			name:           "Successful user login event",
			action:         enums.AuditActionUserLogin,
			status:         enums.AuditStatusSuccess,
			expectedAction: "USER_LOGIN",
			expectedStatus: "SUCCESS",
		},
		{
			name:           "Failed login attempt event",
			action:         enums.AuditActionUserLoginFailed,
			status:         enums.AuditStatusFailed,
			expectedAction: "USER_LOGIN_FAILED",
			expectedStatus: "FAILED",
		},
		{
			name:           "Avatar upload event",
			action:         enums.AuditActionAvatarUploaded,
			status:         enums.AuditStatusSuccess,
			expectedAction: "AVATAR_UPLOADED",
			expectedStatus: "SUCCESS",
		},
		{
			name:           "Password changed event",
			action:         enums.AuditActionPasswordChanged,
			status:         enums.AuditStatusSuccess,
			expectedAction: "PASSWORD_CHANGED",
			expectedStatus: "SUCCESS",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			log := entities.AuditLog{
				UserEmail: "admin@example.com",
				Action:    tt.action,
				Entity:    enums.AuditEntityAuth,
				Status:    tt.status,
				Details:   "Testing audit event creation",
			}

			if string(log.Action) != tt.expectedAction {
				t.Errorf("Action mismatch: got %s, want %s", log.Action, tt.expectedAction)
			}
			if string(log.Status) != tt.expectedStatus {
				t.Errorf("Status mismatch: got %s, want %s", log.Status, tt.expectedStatus)
			}
		})
	}
}

// Table-driven test for Payload formatting
func TestAuditLogPayloadValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		payloadJSON string
		isValidJSON bool
	}{
		{
			name:        "Valid JSON payload snapshot",
			payloadJSON: `{"ip":"127.0.0.1","browser":"Chrome"}`,
			isValidJSON: true,
		},
		{
			name:        "Empty payload",
			payloadJSON: "",
			isValidJSON: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			log := entities.AuditLog{
				Payload: tt.payloadJSON,
			}

			hasContent := len(log.Payload) > 0
			if hasContent != tt.isValidJSON {
				t.Errorf("Payload presence mismatch: got %v, want %v", hasContent, tt.isValidJSON)
			}
		})
	}
}
