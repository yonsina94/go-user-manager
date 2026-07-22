.PHONY: install build-frontend build-backend build run run-offline run-frontend dev dev-offline ensure-air clean

# Directorio de binarios
BIN_DIR = bin
SERVER_BIN = $(BIN_DIR)/server
GOPATH := $(shell go env GOPATH)
AIR := $(GOPATH)/bin/air

# Comando por defecto
all: build

# Instalar todas las dependencias (Backend y Frontend)
install:
	@echo "Installing backend dependencies..."
	go mod download
	@echo "Installing frontend dependencies..."
	cd frontend/user-manager-frontend && pnpm install

# Verificar e instalar Air si no existe
ensure-air:
	@which air > /dev/null 2>&1 || test -f $(AIR) || (echo "Installing air for Go live-reload..." && go install github.com/air-verse/air@latest)

# Modo Desarrollo completo con Hot Reload (Frontend Vite HMR + Backend Go Air Live-Reload)
dev: ensure-air
	@echo "Starting full-stack development environment with Hot Reload..."
	@npx --yes concurrently -k -n "FRONTEND,BACKEND" -c "cyan.bold,yellow.bold" \
		"cd frontend/user-manager-frontend && pnpm dev" \
		"$(AIR)"

# Modo Desarrollo completo con Hot Reload en modo OFFLINE (sin conexión a base de datos)
dev-offline: ensure-air
	@echo "Starting full-stack development environment in OFFLINE mode with Hot Reload..."
	@npx --yes concurrently -k -n "FRONTEND,BACKEND" -c "cyan.bold,yellow.bold" \
		"cd frontend/user-manager-frontend && pnpm dev" \
		"SKIP_DB_CONNECT=true $(AIR)"

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
	rm -rf tmp
	@echo "Clean completed."
