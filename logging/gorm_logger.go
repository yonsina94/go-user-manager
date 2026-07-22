package logging

import (
	"context"
	"errors"
	"log/slog"
	"time"

	gormlogger "gorm.io/gorm/logger"
)

// GormLogger is a custom GORM logger implementation that delegates logs to slog
// and automatically propagates context (e.g. trace_id).
type GormLogger struct {
	logger        *slog.Logger
	logLevel      gormlogger.LogLevel
	slowThreshold time.Duration
}

// NewGormLogger creates a new GormLogger instance.
func NewGormLogger(logger *slog.Logger) *GormLogger {
	return &GormLogger{
		logger:        logger,
		logLevel:      gormlogger.Info,
		slowThreshold: 200 * time.Millisecond,
	}
}

// LogMode sets the log level for GORM.
func (l *GormLogger) LogMode(level gormlogger.LogLevel) gormlogger.Interface {
	newLogger := *l
	newLogger.logLevel = level
	return &newLogger
}

// Info logs messages with standard GORM Info level.
func (l *GormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= gormlogger.Info {
		l.logger.InfoContext(ctx, msg, data...)
	}
}

// Warn logs messages with standard GORM Warn level.
func (l *GormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= gormlogger.Warn {
		l.logger.WarnContext(ctx, msg, data...)
	}
}

// Error logs messages with standard GORM Error level.
func (l *GormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= gormlogger.Error {
		l.logger.ErrorContext(ctx, msg, data...)
	}
}

// Trace logs database SQL statements, execution duration, and errors.
func (l *GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	if l.logLevel <= gormlogger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	fields := []any{
		slog.Duration("duration_ns", elapsed),
		slog.Int64("rows_affected", rows),
		slog.String("sql", sql),
	}

	if err != nil && !errors.Is(err, gormlogger.ErrRecordNotFound) {
		fields = append(fields, slog.String("error", err.Error()))
		l.logger.ErrorContext(ctx, "Database query failed", fields...)
	} else if l.slowThreshold != 0 && elapsed > l.slowThreshold && l.logLevel >= gormlogger.Warn {
		l.logger.WarnContext(ctx, "SLOW SQL >= "+l.slowThreshold.String(), fields...)
	} else if l.logLevel >= gormlogger.Info {
		// Log GORM queries as DEBUG records to avoid cluttering production stdout logs
		l.logger.DebugContext(ctx, "Database query executed", fields...)
	}
}
