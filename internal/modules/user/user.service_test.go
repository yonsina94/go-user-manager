package user_test

import (
	"testing"

	"github.com/yonsina94/go-user-manager/internal/modules/enums"
	"github.com/yonsina94/go-user-manager/internal/modules/user"
	"github.com/yonsina94/go-user-manager/internal/modules/user/entities"
	"gorm.io/gorm"
)

// Table-driven test for User role validation and permissions matching golang-testing rules
func TestUserRoleValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		role         enums.UserRole
		expectedRole string
		isAdmin      bool
	}{
		{
			name:         "Admin role validation",
			role:         enums.ADMIN,
			expectedRole: "Administrador",
			isAdmin:      true,
		},
		{
			name:         "User role validation",
			role:         enums.USER,
			expectedRole: "Usuario",
			isAdmin:      false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			u := entities.User{
				Username: "testuser",
				Email:    "test@example.com",
				Role:     tt.role,
				Active:   true,
			}

			if string(u.Role) != tt.expectedRole {
				t.Errorf("got role %s, want %s", u.Role, tt.expectedRole)
			}

			isAdminResult := (u.Role == enums.ADMIN)
			if isAdminResult != tt.isAdmin {
				t.Errorf("got isAdmin %v, want %v", isAdminResult, tt.isAdmin)
			}
		})
	}
}

// Table-driven test for User Entity Mapper transformations
func TestUserMapper(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		entity         entities.User
		expectedOutput user.UserDTO
	}{
		{
			name: "Map active user with full name",
			entity: entities.User{
				Model:    gorm.Model{ID: 1},
				Name:     "John",
				LastName: "Doe",
				Username: "johndoe",
				Email:    "john@example.com",
				Role:     enums.ADMIN,
				Active:   true,
			},
			expectedOutput: user.UserDTO{
				ID:       1,
				Name:     "John",
				LastName: "Doe",
				Username: "johndoe",
				Email:    "john@example.com",
				Role:     enums.ADMIN,
				Active:   true,
			},
		},
		{
			name: "Map inactive user",
			entity: entities.User{
				Model:    gorm.Model{ID: 2},
				Name:     "Jane",
				LastName: "Smith",
				Username: "janesmith",
				Email:    "jane@example.com",
				Role:     enums.USER,
				Active:   false,
			},
			expectedOutput: user.UserDTO{
				ID:       2,
				Name:     "Jane",
				LastName: "Smith",
				Username: "janesmith",
				Email:    "jane@example.com",
				Role:     enums.USER,
				Active:   false,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res := user.ToUserDTO(tt.entity)

			if res.ID != tt.expectedOutput.ID {
				t.Errorf("ID mismatch: got %d, want %d", res.ID, tt.expectedOutput.ID)
			}
			if res.Email != tt.expectedOutput.Email {
				t.Errorf("Email mismatch: got %s, want %s", res.Email, tt.expectedOutput.Email)
			}
			if res.Role != tt.expectedOutput.Role {
				t.Errorf("Role mismatch: got %s, want %s", res.Role, tt.expectedOutput.Role)
			}
			if res.Active != tt.expectedOutput.Active {
				t.Errorf("Active mismatch: got %v, want %v", res.Active, tt.expectedOutput.Active)
			}
		})
	}
}

// Benchmark for User DTO transformations
func BenchmarkUserMapper(b *testing.B) {
	u := entities.User{
		Model:    gorm.Model{ID: 100},
		Name:     "Benchmark",
		LastName: "User",
		Username: "benchuser",
		Email:    "bench@example.com",
		Role:     enums.USER,
		Active:   true,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = user.ToUserDTO(u)
	}
}
