package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/config"
	"github.com/yonsina94/go-user-manager/controllers"
)

//go:embed web
var webFiles embed.FS

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	// Initialize and load configuration using Viper
	config.LoadConfig()

	if !config.AppConfig.SkipDBConnect {
		config.ConnectDatabase()
	}

	r := gin.Default()

	// Enable CORS
	r.Use(CORSMiddleware())

	// Simple Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Go User Manager API is running"})
	})

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/users", controllers.GetUsers)
		api.GET("/users/:id", controllers.GetUser)
		api.POST("/users", controllers.CreateUser)
		api.PUT("/users/:id", controllers.UpdateUser)
		api.DELETE("/users/:id", controllers.DeleteUser)
	}

	// Serve Static Files from the embedded frontend
	webFS, err := fs.Sub(webFiles, "web")
	if err != nil {
		log.Fatalf("Failed to load embedded web files: %v", err)
	}

	// Serve assets folder
	r.StaticFS("/assets", http.FS(webFS))

	// Fallback para SPA (Single Page Application)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Si es una petición API que no existe, retornar 404
		if strings.HasPrefix(path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not Found"})
			return
		}

		cleanPath := strings.TrimPrefix(path, "/")

		// Si el archivo existe en el FS embebido (como favicon.svg, icons.svg), servirlo
		file, err := webFS.Open(cleanPath)
		if err == nil {
			file.Close()
			c.FileFromFS(cleanPath, http.FS(webFS))
			return
		}

		// En cualquier otro caso, servir index.html para que el router de React maneje el path
		c.FileFromFS("index.html", http.FS(webFS))
	})

	port := config.AppConfig.Port

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
