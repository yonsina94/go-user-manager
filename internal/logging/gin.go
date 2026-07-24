package logging

import (
	"errors"
	"log/slog"
	"net"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GinLogger returns a gin.HandlerFunc (middleware) that logs requests using slog.
// It extracts or creates a Trace ID, injecting it into the context and response headers.
func GinLogger(baseLogger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Try to get trace ID from incoming headers, otherwise generate a new one
		traceID := c.GetHeader("X-Trace-ID")
		if traceID == "" {
			traceID = c.GetHeader("x-trace-id")
		}
		if traceID == "" {
			traceID = uuid.New().String()
		}

		// Inject trace ID into request context
		ctx := ContextWithTraceID(c.Request.Context(), traceID)
		c.Request = c.Request.WithContext(ctx)

		// Set trace ID in Gin context and response headers
		c.Set("traceID", traceID)
		c.Writer.Header().Set("X-Trace-ID", traceID)

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		// Get private errors if any
		var errStr string
		if len(c.Errors) > 0 {
			errStr = c.Errors.String()
		}

		// Prepare attributes
		fullPath := path
		if query != "" {
			fullPath = path + "?" + query
		}

		logger := baseLogger.With(
			slog.String("http_method", method),
			slog.String("http_path", fullPath),
			slog.Int("http_status", statusCode),
			slog.String("client_ip", clientIP),
			slog.Duration("latency", latency),
		)

		if errStr != "" {
			logger.ErrorContext(ctx, "HTTP request failed", slog.String("error", errStr))
		} else if statusCode >= 500 {
			logger.ErrorContext(ctx, "HTTP request failed with server error")
		} else if statusCode >= 400 {
			logger.WarnContext(ctx, "HTTP request completed with client error")
		} else {
			logger.InfoContext(ctx, "HTTP request completed")
		}
	}
}

// GinRecovery returns a gin.HandlerFunc (middleware) that recovers from panics and logs them via slog.
func GinRecovery(baseLogger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Check for a broken connection, as it is not really a panic that we should recover from
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					var se *os.SyscallError
					if errors.As(ne.Err, &se) {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") || strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				// Extract/Generate trace ID
				var traceID string
				if val, exists := c.Get("traceID"); exists {
					traceID, _ = val.(string)
				}
				if traceID == "" {
					traceID = uuid.New().String()
				}
				ctx := ContextWithTraceID(c.Request.Context(), traceID)

				if brokenPipe {
					baseLogger.ErrorContext(ctx, "HTTP connection broken pipe", slog.Any("error", err))
					_ = c.Error(err.(error))
					c.Abort()
					return
				}

				baseLogger.ErrorContext(ctx, "HTTP recovery from panic",
					slog.Any("error", err),
				)
				c.AbortWithStatus(500)
			}
		}()
		c.Next()
	}
}
