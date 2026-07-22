package config

import (
	"fmt"
	"log"
	"time"

	"github.com/yonsina94/go-user-manager/logging"
	"github.com/yonsina94/go-user-manager/modules/enums"
	"github.com/yonsina94/go-user-manager/modules/user/entities"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase(logFactory *logging.LoggerFactory) {
	var gormConfig gorm.Config
	if logFactory != nil {
		gormConfig.Logger = logging.NewGormLogger(logFactory.CreateLogger(logging.ComponentDetails{Name: "Database Connection", Type: "db-connection", Description: "Database Connection"}))
	}
	host := AppConfig.DBHost
	port := AppConfig.DBPort
	user := AppConfig.DBUser
	password := AppConfig.DBPassword
	dbname := AppConfig.DBName

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", host, user, password, dbname, port)
	database, err := gorm.Open(postgres.Open(dsn), &gormConfig)

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 1. Configuración del Connection Pooling
	sqlDB, err := database.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
		sqlDB.SetConnMaxIdleTime(10 * time.Minute)
	}

	// Auto Migrate the schemas
	err = database.AutoMigrate(&entities.User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	DB = database
	log.Println("Database connection successfully established and migrated.")

	// Sembrar usuario administrador por defecto si la base de datos está vacía
	SeedDefaultAdminUser(DB)
}

func SeedDefaultAdminUser(db *gorm.DB) {
	if db == nil {
		return
	}

	var count int64
	if err := db.Model(&entities.User{}).Count(&count).Error; err != nil {
		log.Printf("Error checking user count for seeding: %v", err)
		return
	}

	if count == 0 {
		username := AppConfig.DefaultAdminUser
		plainPassword := AppConfig.DefaultAdminPass
		email := AppConfig.DefaultAdminEmail

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash default admin password: %v", err)
			return
		}

		adminUser := entities.User{
			Name:     "Administrador",
			LastName: "Sistema",
			Username: username,
			Email:    email,
			Password: string(hashedPassword),
			Role:     enums.ADMIN,
			Active:   true,
		}

		if err := db.Create(&adminUser).Error; err != nil {
			log.Printf("Failed to seed default admin user: %v", err)
		} else {
			log.Printf("🔑 Default admin user created: username='%s', password='%s'", username, plainPassword)
		}
	}
}
