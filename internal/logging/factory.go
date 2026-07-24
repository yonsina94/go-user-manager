package logging

import (
	"log/slog"
	"os"
	"strings"

	"github.com/lmittmann/tint"
	"gopkg.in/natefinch/lumberjack.v2"
)

// ComponentDetails contains static context details for a component logger.
type ComponentDetails struct {
	Name        string
	Type        string // "service", "controller", "job", "model", etc.
	Description string
}

type LoggerFactory struct {
	baseHandler slog.Handler
}

// NewLoggerFactory initializes the logging factory.
func NewLoggerFactory(logLevel string, rules MaskingRules) *LoggerFactory {
	var level slog.Level
	switch strings.ToUpper(logLevel) {
	case "DEBUG":
		level = slog.LevelDebug
	case "INFO":
		level = slog.LevelInfo
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	// Console Handler (Pretty-print in debug mode, JSON in production)
	var consoleHandler slog.Handler
	if level == slog.LevelDebug {
		consoleHandler = tint.NewHandler(os.Stdout, &tint.Options{Level: level, TimeFormat: "15:04:05", AddSource: true})
	} else {
		consoleHandler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	}

	// Rotating File Handler
	logFile := &lumberjack.Logger{
		Filename:   "logs/app.log",
		MaxSize:    10, // megabytes
		MaxBackups: 3,
		MaxAge:     28, // days
		Compress:   true,
	}
	fileHandler := slog.NewJSONHandler(logFile, &slog.HandlerOptions{Level: level})

	// Combine Console and File Handlers
	combinedHandler := NewMultiHandler(consoleHandler, fileHandler)

	// Context handler to extract and append Trace IDs
	contextHandler := NewContextHandler(combinedHandler)

	// Wrap inside the masking handler
	finalHandler := NewMaskingHandler(contextHandler, rules)

	return &LoggerFactory{baseHandler: finalHandler}
}

// CreateLogger instantiates a logger with structured component details.
func (f *LoggerFactory) CreateLogger(details ComponentDetails) *slog.Logger {
	return slog.New(f.baseHandler).With(
		"component_name", details.Name,
		"component_type", details.Type,
		"component_description", details.Description,
	)
}

// GetBaseLogger returns the base logger without component details.
func (f *LoggerFactory) GetBaseLogger() *slog.Logger {
	return slog.New(f.baseHandler)
}
