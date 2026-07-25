package logging

import (
	"fmt"
	"log/slog"
	"strings"
)

// MaskingFunc is a function that takes a value and returns its masked representation.
type MaskingFunc func(value slog.Value) any

// MaskingRules is a map associating attribute keys with masking functions.
type MaskingRules map[string]MaskingFunc

// MaskAll hides the entire value.
func MaskAll(_ slog.Value) any {
	return "[MASKED]"
}

// MaskCreditCard shows the first and last 4 digits of a string value.
func MaskCreditCard(value slog.Value) any {
	if value.Kind() != slog.KindString {
		return MaskAll(value)
	}

	str := value.String()
	str = strings.ReplaceAll(str, " ", "")
	if len(str) < 8 {
		return MaskAll(value)
	}

	return fmt.Sprintf("%s **** **** %s", str[:4], str[len(str)-4:])
}

// MaskEmail masks parts of the email username.
func MaskEmail(value slog.Value) any {
	if value.Kind() != slog.KindString {
		return MaskAll(value)
	}

	email := value.String()
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return MaskAll(value)
	}

	username := parts[0]
	if len(username) < 3 {
		return MaskAll(value)
	}

	maskedUsername := string(username[0]) + strings.Repeat("*", len(username)-2) + string(username[len(username)-1])
	return fmt.Sprintf("%s@%s", maskedUsername, parts[1])
}

// MaskJWTToken hides the central payload of a JWT token.
func MaskJWTToken(value slog.Value) any {
	if value.Kind() != slog.KindString {
		return "[MASKED JWT]"
	}
	str := value.String()
	if len(str) < 30 {
		return "[MASKED JWT]"
	}
	return fmt.Sprintf("%s...[TRUNCATED]...%s", str[:10], str[len(str)-10:])
}

// GetDefaultMaskingRules returns the masking rules for sensitive cryptographic fields.
func GetDefaultMaskingRules() MaskingRules {
	return MaskingRules{
		"token": MaskJWTToken,
		"email": MaskEmail,
	}
}
