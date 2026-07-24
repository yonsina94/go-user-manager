package main

import (
	"context"
	"embed"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/internal/config"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/modules"
)

//go:embed web
var webFiles embed.FS

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Trace-ID")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	lf := logging.NewLoggerFactory("INFO", logging.GetDefaultCKMMaskingRules())

	// Connect to the database

	if !config.AppConfig.SkipDBConnect {
		config.ConnectDatabase(lf)
	}

	r := gin.Default()

	ginLogger := lf.CreateLogger(logging.ComponentDetails{
		Name:        "Gin Engine",
		Type:        "gin-engine",
		Description: "Gin Engine",
	})
	r.Use(logging.GinLogger(ginLogger), logging.GinRecovery(ginLogger))

	// Enable CORS
	r.Use(CORSMiddleware())

	// Simple Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Go User Manager API is running"})
	})

	// API Routes
	modules.InitModules(config.DB, lf, r)

	// Serve Static Files from the embedded frontend
	webFS, err := fs.Sub(webFiles, "web")
	if err != nil {
		log.Fatalf("Failed to load embedded web files: %v", err)
	}

	indexHTML, err := fs.ReadFile(webFS, "index.html")
	if err != nil {
		log.Fatalf("Failed to read index.html: %v", err)
	}

	// Serve assets folder
	assetsFS, err := fs.Sub(webFS, "assets")
	if err == nil {
		r.StaticFS("/assets", http.FS(assetsFS))
	}

	// Fallback para SPA (Single Page Application)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Si es una petición API que no existe, retornar 404
		if strings.HasPrefix(path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not Found"})
			return
		}

		cleanPath := strings.TrimPrefix(path, "/")

		// Si el archivo existe en el FS embebido y no es un directorio (como favicon.svg, icons.svg), servirlo
		if cleanPath != "" {
			file, err := webFS.Open(cleanPath)
			if err == nil {
				stat, statErr := file.Stat()
				file.Close()
				if statErr == nil && !stat.IsDir() {
					c.FileFromFS(cleanPath, http.FS(webFS))
					return
				}
			}
		}

		// En cualquier otro caso, servir index.html para que el router de React maneje el path
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
	})

	port := config.AppConfig.Port

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Iniciar el servidor HTTP en una goroutine secundaria
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Esperar señal de interrupción para apagar el servidor de forma elegante (Graceful Shutdown)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")

	// Contexto con timeout de 5s para que las peticiones activas finalicen
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	// Cerrar las conexiones abiertas de la base de datos
	if config.DB != nil {
		if sqlDB, err := config.DB.DB(); err == nil {
			log.Println("Closing database connections...")
			if err := sqlDB.Close(); err != nil {
				log.Printf("Error closing database connections: %v", err)
			}
		}
	}

	log.Println("Server exited cleanly.")
}
