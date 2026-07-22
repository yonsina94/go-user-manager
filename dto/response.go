package dto

// APIResponse es un DTO genérico para todas las respuestas que se envían al frontend.
type APIResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    T      `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

// NewSuccessResponse crea una respuesta exitosa estandarizada.
func NewSuccessResponse[T any](data T, message string) APIResponse[T] {
	return APIResponse[T]{
		Success: true,
		Message: message,
		Data:    data,
	}
}

// NewErrorResponse crea una respuesta de error estandarizada.
func NewErrorResponse(err string, message string) APIResponse[any] {
	return APIResponse[any]{
		Success: false,
		Message: message,
		Error:   err,
	}
}

