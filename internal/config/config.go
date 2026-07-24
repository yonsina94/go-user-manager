package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Port                 string `mapstructure:"PORT"`
	DBHost               string `mapstructure:"DB_HOST"`
	DBPort               string `mapstructure:"DB_PORT"`
	DBUser               string `mapstructure:"DB_USER"`
	DBPassword           string `mapstructure:"DB_PASSWORD"`
	DBName               string `mapstructure:"DB_NAME"`
	SkipDBConnect        bool   `mapstructure:"SKIP_DB_CONNECT"`
	DefaultAdminUser     string `mapstructure:"DEFAULT_ADMIN_USER"`
	DefaultAdminPass     string `mapstructure:"DEFAULT_ADMIN_PASS"`
	DefaultAdminEmail    string `mapstructure:"DEFAULT_ADMIN_EMAIL"`
	SMTPHost             string `mapstructure:"SMTP_HOST"`
	SMTPPort             int    `mapstructure:"SMTP_PORT"`
	SMTPFrom             string `mapstructure:"SMTP_FROM"`
	FrontendURL          string `mapstructure:"FRONTEND_URL"`
	S3Endpoint           string `mapstructure:"S3_ENDPOINT"`
	S3Region             string `mapstructure:"S3_REGION"`
	S3Bucket             string `mapstructure:"S3_BUCKET"`
	S3AccessKey          string `mapstructure:"S3_ACCESS_KEY"`
	S3SecretKey          string `mapstructure:"S3_SECRET_KEY"`
	S3UseSSL             bool   `mapstructure:"S3_USE_SSL"`
	S3PublicURL          string `mapstructure:"S3_PUBLIC_URL"`
}

var AppConfig Config

func init() {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	// Set default values
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "postgres")
	viper.SetDefault("SKIP_DB_CONNECT", false)
	viper.SetDefault("DEFAULT_ADMIN_USER", "admin")
	viper.SetDefault("DEFAULT_ADMIN_PASS", "admin123")
	viper.SetDefault("DEFAULT_ADMIN_EMAIL", "admin@example.com")
	viper.SetDefault("SMTP_HOST", "localhost")
	viper.SetDefault("SMTP_PORT", 1025)
	viper.SetDefault("SMTP_FROM", "no-reply@gousermanager.local")
	viper.SetDefault("FRONTEND_URL", "http://localhost:5173")
	viper.SetDefault("S3_ENDPOINT", "localhost:9000")
	viper.SetDefault("S3_REGION", "us-east-1")
	viper.SetDefault("S3_BUCKET", "user-avatars")
	viper.SetDefault("S3_ACCESS_KEY", "minioadmin")
	viper.SetDefault("S3_SECRET_KEY", "minioadminpassword")
	viper.SetDefault("S3_USE_SSL", false)
	viper.SetDefault("S3_PUBLIC_URL", "http://localhost:9000")

	// Attempt to read config file
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("No .env file found or error reading it: %v. Using defaults or environment variables.", err)
	}

	// Unmarshal config into AppConfig struct
	if err := viper.Unmarshal(&AppConfig); err != nil {
		log.Fatalf("Unable to decode config into struct: %v", err)
	}
}
