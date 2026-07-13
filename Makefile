.PHONY: install build-frontend build-backend build run run-offline run-frontend clean

# Directorio de binarios
BIN_DIR = bin
SERVER_BIN = $(BIN_DIR)/server

# Comando por defecto
all: build

# Instalar todas las dependencias (Backend y Frontend)
install:
	@echo "Installing backend dependencies..."
	go mod download
	@echo "Installing frontend dependencies..."
	cd frontend/user-manager-frontend && pnpm install

# Construir los assets de producción del frontend
build-frontend:
	@echo "Building React frontend..."
	cd frontend/user-manager-frontend && pnpm build

# Construir el ejecutable de Go (requiere el frontend construido para el embed)
build-backend: build-frontend
	@echo "Building Go server..."
	mkdir -p $(BIN_DIR)
	go build -o $(SERVER_BIN) main.go
	@echo "Server binary built at: $(SERVER_BIN)"

# Alias para construir todo
build: build-backend

# Ejecutar el servidor Go con conexión a base de datos (requiere PostgreSQL corriendo)
run: build-frontend
	@echo "Starting Go server..."
	go run main.go

# Ejecutar el servidor Go saltándose la conexión de base de datos (útil para pruebas de UI y offline)
run-offline: build-frontend
	@echo "Starting Go server in OFFLINE mode (skipping DB connection)..."
	SKIP_DB_CONNECT=true go run main.go

# Ejecutar el frontend en modo de desarrollo (hot-reload)
run-frontend:
	@echo "Starting React frontend dev server..."
	cd frontend/user-manager-frontend && pnpm dev

# Limpiar los artefactos generados por el build
clean:
	@echo "Cleaning build artifacts..."
	rm -rf web
	rm -rf $(BIN_DIR)
	@echo "Clean completed."
