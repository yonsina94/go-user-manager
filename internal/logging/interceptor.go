package logging

import (
	"context"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type contextKey string

const traceIDKey = contextKey("traceID")

// ContextWithTraceID adds the traceID to context.
func ContextWithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDKey, traceID)
}

// TraceIDFromContext extracts the traceID from context.
func TraceIDFromContext(ctx context.Context) string {
	if id, ok := ctx.Value(traceIDKey).(string); ok {
		return id
	}
	return ""
}

// AccessLogInterceptor creates a gRPC interceptor that logs unary requests with trace ID.
func AccessLogInterceptor(baseLogger *slog.Logger) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		startTime := time.Now()

		var traceID string
		if md, ok := metadata.FromIncomingContext(ctx); ok && len(md.Get("x-trace-id")) > 0 {
			traceID = md.Get("x-trace-id")[0]
		} else {
			traceID = uuid.New().String()
		}

		ctx = ContextWithTraceID(ctx, traceID)

		resp, err := handler(ctx, req)

		duration := time.Since(startTime)
		statusCode := status.Code(err)

		accessLogger := baseLogger.With(
			"trace_id", traceID,
			"grpc_method", info.FullMethod,
			"duration_ms", duration.Milliseconds(),
			"status_code", statusCode.String(),
		)

		if err != nil {
			accessLogger.Error("gRPC request failed", "error", err.Error())
		} else {
			accessLogger.Info("gRPC request completed")
		}

		return resp, err
	}
}
