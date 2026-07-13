package config

import (
	"fmt"
	"log"

	"github.com/yonsina94/go-user-manager/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := AppConfig.DBHost
	port := AppConfig.DBPort
	user := AppConfig.DBUser
	password := AppConfig.DBPassword
	dbname := AppConfig.DBName

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", host, user, password, dbname, port)
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migrate the schemas
	err = database.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	DB = database
	log.Println("Database connection successfully established and migrated.")
}
