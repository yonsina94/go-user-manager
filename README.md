# 🚀 Go User Manager

[![Go Version](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat&logo=docker)](https://www.docker.com/)

**Go User Manager** es una plataforma full-stack moderna y completa para la gestión de usuarios, autenticación y control de accesos basada en roles (RBAC). El sistema cuenta con un backend robusto de alto rendimiento escrito en **Go (Gin + GORM)** y una interfaz SPA moderna desarrollada con **React 19, TypeScript y Vite**.

Toda la aplicación frontend se compila y se embebe directamente en un **único ejecutable de Go** mediante `go:embed`, facilitando el despliegue sin dependencias adicionales en producción.

---

## 📑 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías y Herramientas](#️-tecnologías-y-herramientas)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [🔌 Endpoints de la API REST](#-endpoints-de-la-api-rest)
- [🔒 Seguridad y Logging Enmascarado](#-seguridad-y-logging-enmascarado)
- [🚀 Instalación y Desarrollo Local](#-instalación-y-desarrollo-local)
- [🛠️ Comandos de Makefile](#️-comandos-de-makefile)
- [🐳 Entorno Docker y DevContainers](#-entorno-docker-y-devcontainers)

---

## ✨ Características Principales

### 🔑 Autenticación y Autorización
- **Registro de usuarios y Login de sesión**: Con cifrado seguro de contraseñas mediante **Bcrypt**.
- **Autenticación mediante JWT (JSON Web Tokens)**: Middleware de validación Bearer Token en endpoints protegidos.
- **Control de Acceso basado en Roles (RBAC)**: Roles de `Administrador` y `Usuario`.
- **Recuperación de Contraseña**: Flujo de generación de tokens de restablecimiento y envío por correo electrónico (integración SMTP / Mailpit).

### 👤 Gestión de Usuarios
- **Perfil de Usuario**: Actualización de información personal, nombre de usuario y correo electrónico.
- **Carga de Avatares**: Subida y almacenamiento de imágenes de perfil integrados con almacenamiento compatible con S3 (MinIO / AWS S3).
- **Panel de Administración**: Gestión completa (CRUD), modificación de roles y activación/desactivación de cuentas.
- **Búsqueda y Paginación**: Filtrado de usuarios por término y paginación en el backend.

### ⚡ Modo Offline / UI Preview
- Permite ejecutar el servidor de desarrollo y la API saltándose la conexión obligatoria a base de datos (`SKIP_DB_CONNECT=true`), facilitando la maquetación y pruebas rápidas de interfaz gráfica sin infraestructura activa.

---

## 🛠️ Tecnologías y Herramientas

### Backend
- **[Go 1.26+](https://golang.org/)**: Lenguaje principal.
- **[Gin Gonic](https://github.com/gin-gonic/gin)**: Framework web HTTP de alto rendimiento.
- **[GORM](https://gorm.io/)**: ORM para interacción fluida con la base de datos PostgreSQL.
- **[Slog + Lumberjack]**: Logging estructurado con formato JSON/Text, rotación de logs y **enmascaramiento automático de datos sensibles (CKM Masking)** (tokens, contraseñas, emails).
- **[MinIO Go SDK]**: Integración con almacenamiento en la nube compatible con S3 para avatares.
- **[Templ]**: Motor de plantillas Go tipadas para renderizado de correos o HTML.

### Frontend
- **[React 19](https://react.dev/)**: Biblioteca UI moderna con soporte para React Compiler.
- **[TypeScript 6](https://www.typescriptlang.org/)**: Tipado estático estricto.
- **[Vite 8](https://vitejs.dev/)**: Bundler y dev-server ultra rápido con Hot Module Replacement (HMR).
- **[Tailwind CSS v4](https://tailwindcss.com/) & [Styled Components]**: Estilizado moderno, responsivo y dinámico.
- **[React Router DOM v7](https://reactrouter.com/)**: Enrutamiento para SPA (Single Page Application).

### Herramientas de Desarrollo
- **[Air](https://github.com/air-verse/air)**: Hot Reload para el backend en Go.
- **[Mailpit](https://github.com/axllent/mailpit)**: Servidor SMTP local para captura y visualización de correos electrónicos en desarrollo.
- **[Docker & DevContainers]**: Entorno aislado y reproducible de desarrollo.

---

## 📁 Estructura del Proyecto

```
go-user-manager/
├── .devcontainer/               # Configuración de DevContainer y Docker Compose
│   ├── Dockerfile
│   └── docker-compose.yml
├── bin/                         # Binarios generados del servidor (bin/server)
├── frontend/                    # Aplicación React frontend (Feature-First)
│   └── user-manager-frontend/
│       ├── src/
│       │   ├── components/      # Componentes UI globales agnósticos
│       │   ├── features/        # Módulos de dominio (auth, users, settings)
│       │   ├── layouts/         # Layouts principales de la SPA
│       │   ├── routes/          # Definición y protección de rutas
│       │   └── services/        # Cliente API Axios/Fetch y servicios
│       ├── package.json
│       └── vite.config.ts
├── internal/                    # Código interno y privado del backend Go
│   ├── config/                  # Configuración global y conexión DB
│   ├── logging/                 # Logger Slog con enmascaramiento de datos CKM
│   ├── middleware/              # Middlewares de Gin (Auth JWT, Roles, CORS)
│   ├── modules/                 # Módulos de dominio (user/entities, user.controller.go, etc.)
│   └── templates/               # Plantillas Templ para correos
├── pkg/                         # Paquetes reutilizables/globales
│   ├── dto/                     # DTOs globales de respuesta HTTP (response.go)
│   ├── email/                   # Servicio de envío de correo SMTP
│   ├── query/                   # Paginación y criterios de búsqueda DB
│   └── storage/                 # Almacenamiento en MinIO/S3 para avatares
├── .air.toml                    # Configuración de live-reload con Air
├── .env.example                 # Plantilla de variables de entorno
├── Makefile                     # Scripts de automatización de comandos
└── main.go                      # Punto de entrada de la aplicación Go
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto en el que escucha el servidor Go | `8080` |
| `DB_HOST` | Host de la base de datos PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `go_user_manager` |
| `SKIP_DB_CONNECT` | Omitir la conexión a DB (Modo UI Offline) | `false` |
| `DEFAULT_ADMIN_USER` | Usuario admin inicial generado en el seed | `admin` |
| `DEFAULT_ADMIN_PASS` | Contraseña inicial del admin | `admin123` |
| `DEFAULT_ADMIN_EMAIL` | Email del admin inicial | `admin@example.com` |
| `SMTP_HOST` | Host del servidor SMTP para emails | `localhost` |
| `SMTP_PORT` | Puerto del servidor SMTP | `1025` |
| `SMTP_FROM` | Remitente de correos del sistema | `no-reply@gousermanager.local` |
| `S3_ENDPOINT` | Endpoint de MinIO / S3 | `localhost:9000` |
| `S3_BUCKET` | Nombre del bucket para imágenes de avatares | `user-avatars` |
| `S3_ACCESS_KEY` | Llave de acceso de S3 | `minioadmin` |
| `S3_SECRET_KEY` | Llave secreta de S3 | `minioadminpassword` |
| `S3_USE_SSL` | Usar HTTPS/SSL para S3 | `false` |
| `S3_PUBLIC_URL` | URL pública para servir avatares | `http://localhost:9000` |

---

## 🔌 Endpoints de la API REST

Todas las rutas de la API están prefijadas con `/api/user`.

### 🔓 Endpoints Públicos
- `GET /health` - Verificación del estado del servidor.
- `POST /api/user/register` - Registro de nuevos usuarios.
- `POST /api/user/login` - Autenticación y obtención de JWT Bearer token.
- `POST /api/user/forgot-password` - Solicitud de restablecimiento de contraseña vía email.
- `POST /api/user/reset-password` - Confirmación de cambio de contraseña mediante token.

### 🔒 Endpoints Protegidos (Requieren cabecera `Authorization: Bearer <token>`)
- `POST /api/user/logout` - Cierre de sesión.
- `GET /api/user/profile` - Obtener perfil del usuario autenticado.
- `PUT /api/user/profile` - Actualizar información del perfil.
- `PUT /api/user/:id/avatar` - Subir/actualizar foto de perfil (Multipart Form Data).
- `PUT /api/user/password` - Cambio de contraseña requiriendo la actual.
- `PUT /api/user/email` - Cambiar dirección de correo electrónico.
- `PUT /api/user/username` - Cambiar nombre de usuario.
- `DELETE /api/user/account` - Eliminar la cuenta del usuario actual.
- `GET /api/user/:id` - Obtener información pública de un usuario por ID.

### 👑 Endpoints de Administrador (Requieren Rol `Administrador`)
- `GET /api/user/users` - Lista paginada de todos los usuarios registrados.
- `POST /api/user/search` - Búsqueda avanzada de usuarios.
- `PUT /api/user/role` - Cambiar el rol de un usuario (`Usuario` / `Administrador`).
- `PUT /api/user/status` - Activar o desactivar cuenta de usuario.
- `PUT /api/user/:id` - Editar información de usuario desde el panel admin.
- `DELETE /api/user/:id` - Eliminar usuario desde el panel admin.

---

## 🔒 Seguridad y Logging Enmascarado

El proyecto incorpora un módulo especializado de **Logging con CKM Data Masking** (`logging/masking.go`):
- Los registros del sistema evitan la fuga de datos sensibles (contraseñas, tokens JWT, números de tarjetas de crédito o correos) en los archivos de log.
- Utiliza sustitución por máscaras (ejemplo: `usr_****@domain.com` o `****`) de forma automática en los payloads y consultas procesadas por Gin y GORM.

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos
- [Go 1.26+](https://golang.org/dl/)
- [Node.js 20+] y [pnpm](https://pnpm.io/)
- [Docker & Docker Compose](https://www.docker.com/) (para PostgreSQL, MinIO y Mailpit)

### 1. Clonar el repositorio y configurar variables
```bash
git clone https://github.com/yonsina94/go-user-manager.git
cd go-user-manager
cp .env.example .env
```

### 2. Instalar dependencias
```bash
make install
```

### 3. Iniciar el entorno en modo Desarrollo (Full Stack Hot-Reload)
Este comando levanta tanto el backend en Go (vía Air live-reload) como el frontend en React (vía Vite HMR) en paralelo:
```bash
make dev
```

Si prefieres probar la UI sin levantar PostgreSQL ni MinIO:
```bash
make dev-offline
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:8080`.

---

## 🛠️ Comandos de Makefile

El archivo `Makefile` provee comandos optimizados para gestionar el proyecto:

| Comando | Descripción |
| :--- | :--- |
| `make install` | Instala todas las dependencias de Go y del Frontend (pnpm), además de CLI tools (`air`, `templ`). |
| `make dev` | Ejecuta el entorno de desarrollo Full-Stack completo con Live Reload. |
| `make dev-offline` | Ejecuta el entorno de desarrollo omitiendo la conexión a la base de datos. |
| `make build` | Compila los assets del frontend y los empaqueta en el ejecutable final de Go (`bin/server`). |
| `make build-frontend` | Compila únicamente la SPA de React a la carpeta `web/`. |
| `make build-backend` | Compila el frontend y genera el binario distribuible de Go (`bin/server`). |
| `make run` | Compila el frontend e inicia el servidor Go en modo de ejecución directa. |
| `make run-offline` | Ejecuta el servidor Go en modo offline sin conexión DB. |
| `make clean` | Elimina binarios generados (`bin/`), archivos de `web/` y temporales. |

---

## 🐳 Entorno Docker y DevContainers

El repositorio está completamente preparado para trabajar con **VS Code DevContainers**.

Al abrir el proyecto en VS Code con la extensión *Dev Containers*, se levantarán automáticamente los siguientes servicios dentro de la red del contenedor:

- **App Container**: Entorno con Go, Node.js, pnpm, Air y herramientas de desarrollo.
- **PostgreSQL**: Base de datos relational en el puerto `5432`.
- **Mailpit**: Captura de correos de prueba.
  - SMTP: `localhost:1025`
  - Web UI: `http://localhost:8025`
- **MinIO**: Almacenamiento S3 para avatares.
  - API S3: `http://localhost:9000`
  - Consola Web: `http://localhost:9001` (Usuario: `minioadmin` / Clave: `minioadminpassword`)

---

## 📄 Licencia

Este proyecto está distribuido bajo los términos de la licencia MIT.
