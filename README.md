# 🚀 Go User Manager

[![Go Version](https://img.shields.io/badge/Go-1.26.4-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-19.2.7-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3.2-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat&logo=docker)](https://www.docker.com/)

**Go User Manager** es una plataforma full-stack moderna y completa para la gestión de usuarios, autenticación y control de accesos basada en roles (RBAC). El sistema cuenta con un backend robusto de alto rendimiento escrito en **Go (Gin + GORM)** y una interfaz SPA moderna desarrollada con **React 19, TypeScript, Vite y Tailwind CSS v4**.

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
- [📄 Licencia](#-licencia)

---

## ✨ Características Principales

### 🔑 Autenticación y Autorización
- **Registro de usuarios y Login de sesión**: Cifrado seguro de contraseñas mediante **Bcrypt**.
- **Autenticación mediante JWT (JSON Web Tokens)**: Middleware de validación Bearer Token en endpoints protegidos.
- **Revocación de Tokens JWT (Lista Negra / Blacklist)**: Inhabilitación inmediata de tokens al cerrar sesión (`POST /api/user/logout`), almacenados con hash SHA-256 en PostgreSQL e inspeccionados en `AuthMiddleware`.
- **Control de Acceso basado en Roles (RBAC)**: Distinción entre roles de `Administrador` y `Usuario`.
- **Recuperación de Contraseña**: Generación de tokens de restablecimiento temporales con expiración y envío de plantillas HTML compiladas con **Templ** a través de SMTP (**Mailpit** en desarrollo).

### 👤 Gestión de Usuarios
- **Perfil de Usuario**: Consulta y actualización de información personal (nombre, apellido, nombre de usuario y correo electrónico).
- **Gestión de Avatares y Lightbox**: Subida, recortado interactivo en HD, almacenamiento S3 (**MinIO / AWS S3**) y previsualización extendida (*Lightbox*) al hacer clic en fotos de perfil.
- **Panel de Administración**: Gestión completa de usuarios (CRUD), asignación de roles (`Usuario` / `Administrador`), activación/desactivación de cuentas y **Modal de Confirmación de Eliminación** estético.
- **Búsqueda y Paginación**: Filtrado dinámico por parámetros de búsqueda y paginación en backend y frontend.
- **Exportación de Reportes a CSV (Rich Struct Tags)**: Generación streaming de reportes CSV procesando dinámicamente etiquetas estructuradas `csv:"Header;case:title;boolean:Activo/Inactivo;date_format:..."` en DTOs ([pkg/csv](file:///workspaces/go-user-manager/pkg/csv/csv.go)), con formateo de fechas, mayúsculas/minúsculas, truncado, prefijos/sufijos y firma BOM UTF-8 para Excel.

### 📋 Módulo de Auditoría y Trazabilidad de Seguridad (Audit Logs)
- **Registro Automático de Eventos**: Registro persistente en PostgreSQL de acciones críticas del sistema (`USER_LOGIN`, `USER_LOGIN_FAILED`, `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`, `AVATAR_UPLOADED`, `PASSWORD_CHANGED`, `USER_EXPORTED`, `USER_LOGOUT`).
- **Captura de Metadatos**: Captura IP de origen, User-Agent, método HTTP, ruta, estado, correo de usuario y **payload de la petición (JSON)**.
- **Consola de Auditoría en Frontend (`AuditLogsPage`)**: Interfaz dedicada para administradores con filtrado por tipo de evento, búsqueda por IP/correo, paginación dinámica y **Modal de Inspección de Payloads (`AuditDetailModal`)**.

### ⚡ Modo Offline / UI Preview
- Permite ejecutar el servidor sin requerir una conexión activa a la base de datos PostgreSQL (`SKIP_DB_CONNECT=true`), facilitando maquetación y pruebas rápidas de UI.

---

## 🛠️ Tecnologías y Herramientas

### Backend
- **[Go 1.26.4](https://golang.org/)**: Lenguaje principal de alto rendimiento y concurrencia.
- **[Gin Gonic 1.12](https://github.com/gin-gonic/gin)**: Framework web HTTP rápido y flexible.
- **[GORM 1.31](https://gorm.io/)**: ORM para interacción fluida con PostgreSQL.
- **[Slog + Lumberjack + Tint]**: Logging estructurado JSON/Text con colores en consola, rotación de archivos y **CKM Masking** para ocultar contraseñas, tokens y emails.
- **[MinIO Go SDK 7.2](https://min.io/)**: Almacenamiento de objetos compatible con AWS S3 para avatares.
- **[Templ 0.3](https://templ.guide/)**: Componentes y plantillas HTML con tipado estricto en Go.
- **[Viper 1.21](https://github.com/spf13/viper)**: Gestión centralizada de configuración y variables de entorno.

### Frontend
- **[React 19.2](https://react.dev/)**: Biblioteca UI moderna con soporte para Form Actions nativos (`action={...}`), concurrencia (`useTransition`) y React Compiler.
- **[TypeScript 6.0](https://www.typescriptlang.org/)**: Sistema de tipos estático estricto.
- **[Vite 8.1](https://vitejs.dev/)**: Tooling frontend y dev-server ultra rápido con HMR.
- **[Tailwind CSS 4.3](https://tailwindcss.com/) & [Styled Components 6.4]**: Estilizado utility-first combinado con componentes estilizados y tokens OKLCH.
- **[Lucide React 1.26](https://lucide.dev/)**: Iconografía vectorial stroke-consistent que sustituye emojis del sistema.
- **[Google Fonts]**: Emparejamiento tipográfico moderno (*Space Grotesk* para encabezados, *Inter* para cuerpo, *JetBrains Mono* para código/roles).
- **[React Router DOM v7](https://reactrouter.com/)**: Enrutamiento para SPA.
- **[Oxlint 1.71](https://oxc.rs/)**: Linter ultra rápido en Rust para JS/TS.

### Herramientas de Desarrollo
- **[Air](https://github.com/air-verse/air)**: Live reload para el backend en Go.
- **[Mailpit](https://github.com/axllent/mailpit)**: Servidor SMTP local y consola web de inspección de emails.
- **[Docker & DevContainers]**: Entorno de desarrollo aislado y totalmente reproducible.

---

## 📁 Estructura del Proyecto

```
go-user-manager/
├── .devcontainer/               # Configuración de DevContainer y Docker Compose
│   ├── Dockerfile
│   ├── devcontainer.json
│   ├── devcontainer-lock.json
│   └── docker-compose.yml
├── .github/                     # Integraciones y configuraciones de GitHub (Dependabot)
│   └── dependabot.yml
├── bin/                         # Binario compilado del servidor Go (bin/server)
├── design.md                    # Especificación del Sistema de Diseño Hallmark (anti-AI-slop)
├── frontend/                    # Aplicación React (SPA Feature-First)
│   └── user-manager-frontend/
│       ├── public/              # Favicon e íconos estáticos SVG
│       ├── src/
│       │   ├── components/      # Componentes UI reutilizables (AvatarPreviewModal, UserAvatar, Cropper, Pagination)
│       │   ├── context/         # Contextos globales (ThemeContext - Auto Dark Mode, AuthContext)
│       │   ├── features/        # Módulos por dominio
│       │   │   ├── audit/       # Módulo de Auditoría (AuditLogsPage, AuditDetailModal, tipos)
│       │   │   ├── auth/        # Módulo de Autenticación (LoginPage, RecoverPasswordPage)
│       │   │   ├── profile/     # Módulo de Perfil (ProfilePage)
│       │   │   ├── settings/    # Módulo de Configuración (SettingsPage)
│       │   │   └── users/       # Módulo de Usuarios (UsersPage, CreateUserModal, EditUserModal, DeleteUserModal)
│       │   ├── layouts/         # Layout del Dashboard y navegación Workbench (Mobile Drawer + Sidebar)
│       │   ├── routes/          # Rutas públicas y protegidas (ProtectedRoute)
│       │   ├── services/        # Cliente API Axios y servicios
│       │   ├── types/           # Definición de tipos TypeScript (DTOs, Queries)
│       │   ├── utils/           # Helper funciones (Gravatar, etc.)
│       │   ├── App.tsx          # Configuración principal de React Router
│       │   └── main.tsx         # Punto de entrada de React
│       ├── package.json
│       ├── vite.config.ts
│       └── .oxlintrc.json
├── internal/                    # Código privado de la aplicación Go
│   ├── config/                  # Configuración con Viper y conexión a PostgreSQL (SKIP_DB_CONNECT)
│   ├── logging/                 # Logging estructurado Slog, Tint handler y CKM Masking
│   ├── middleware/              # Middlewares de Gin (Auth JWT, Roles, CORS, Slog Logger)
│   ├── modules/                 # Módulos de dominio de backend
│   │   ├── audit/               # Módulo de Auditoría (AuditController, AuditService, AuditLog Entity)
│   │   ├── commons/             # Interfaces comunes (Transformer/Mapper)
│   │   ├── enums/               # Enumeraciones de roles (ADMIN, USER) y acciones de auditoría
│   │   └── user/                # Controladores, servicios, DTOs y entidades de usuario
│   └── templates/               # Plantillas Templ para correos (Password Reset HTML)
├── pkg/                         # Paquetes reutilizables/compartidos
│   ├── dto/                     # Respuestas estandarizadas HTTP (Success / Error Response)
│   ├── email/                   # Servicio de envío de correo SMTP (Mailpit compatible)
│   ├── query/                   # Paginación y criterios de búsqueda dinámica GORM (QueryFilter)
│   └── storage/                 # Servicio de almacenamiento MinIO / AWS S3
├── web/                         # Frontend React compilado (generado por Vite para go:embed)
├── .air.toml                    # Configuración de live-reload con Air
├── .env.example                 # Plantilla de variables de entorno
├── Makefile                     # Scripts de automatización de comandos
└── main.go                      # Punto de entrada de la aplicación Go y servido estático SPA
```

---

## 🎨 Sistema de Diseño y UI (Hallmark)

El frontend ha sido auditado y modernizado mediante el estándar de diseño **Hallmark** ([design.md](file:///workspaces/go-user-manager/design.md)) bajo **React 19**:

- **Género**: `modern-minimal` orientado a herramientas SaaS y plataformas de gestión.
- **Form Actions y Concurrencia (React 19)**: Eliminación de manejadores manuales `onSubmit` / `FormEvent` en favor de `action={...}` nativo y `useTransition` para estados `isPending` no bloqueantes.
- **Modo Oscuro Inteligente (ThemeContext)**: Soporte para **Automático (Hora del día 19:00 - 07:00)**, **Preferencia del Sistema OS**, **Claro** y **Oscuro** persistido en `localStorage`.
- **Modales Estéticos y Lightbox**: Modal de confirmación para eliminación de cuentas (`DeleteUserModal`), inspección JSON de auditoría (`AuditDetailModal`) y previsualizador de fotos extendidas (`AvatarPreviewModal`).
- **Experiencia Móvil Adaptativa**: Barra superior fija en smartphones con conmutador táctil de tema y menú sobrepuesto animado (*Drawer* con *backdrop blur*).
- **Paleta OKLCH**: Variables centralizadas en `index.css` (`--color-paper`, `--color-ink`, `--color-accent`, `--color-rule`) con soporte para modo claro y oscuro.
- **Iconografía Vectorial**: Cero uso de emojis del sistema operativo; sustitución por íconos SVG de **Lucide React**.
- **Tipografía Pura**: Sin títulos en cursiva (*No italic headers*), garantizando una jerarquía visual limpia.

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
| `DB_NAME` | Nombre de la base de datos PostgreSQL | `go_user_manager` |
| `SKIP_DB_CONNECT` | Omitir la conexión a DB (Modo UI Offline) | `false` |
| `DEFAULT_ADMIN_USER` | Usuario admin inicial generado en el seeder | `admin` |
| `DEFAULT_ADMIN_PASS` | Contraseña inicial del administrador | `admin123` |
| `DEFAULT_ADMIN_EMAIL` | Email del administrador inicial | `admin@example.com` |
| `SMTP_HOST` | Host del servidor SMTP para correos | `localhost` |
| `SMTP_PORT` | Puerto del servidor SMTP | `1025` |
| `SMTP_FROM` | Remitente de correos del sistema | `no-reply@gousermanager.local` |
| `FRONTEND_URL` | URL base del frontend para enlaces en correos | `http://localhost:5173` |
| `S3_ENDPOINT` | Endpoint del servidor MinIO / S3 | `localhost:9000` |
| `S3_REGION` | Región para el servicio S3 | `us-east-1` |
| `S3_BUCKET` | Nombre del bucket para avatares de usuario | `user-avatars` |
| `S3_ACCESS_KEY` | Llave de acceso de S3 / MinIO | `minioadmin` |
| `S3_SECRET_KEY` | Llave secreta de S3 / MinIO | `minioadminpassword` |
| `S3_USE_SSL` | Usar HTTPS/SSL en conexión a S3 | `false` |
| `S3_PUBLIC_URL` | URL pública utilizada para servir los avatares | `http://localhost:9000` |

---

## 🔌 Endpoints de la API REST

Todas las rutas principales de la API están agrupadas bajo el prefijo `/api/user`.

### 🔓 Endpoints Públicos
- `GET /health` - Verificación del estado del servidor.
- `POST /api/user/register` - Registro de un nuevo usuario en la plataforma.
- `POST /api/user/login` - Autenticación de usuario y obtención del token JWT Bearer.
- `POST /api/user/forgot-password` - Solicitud de restablecimiento de contraseña vía correo.
- `POST /api/user/reset-password` - Restablecimiento de contraseña utilizando un token válido.

### 🔒 Endpoints Protegidos (Requieren cabecera `Authorization: Bearer <token>`)
- `POST /api/user/logout` - Cierre de sesión del usuario e inhabilitación inmediata del token en la lista negra (*JWT Blacklist*).
- `GET /api/user/profile` - Obtener información del perfil del usuario autenticado.
- `PUT /api/user/profile` - Actualizar información del perfil (nombre, apellido).
- `PUT /api/user/:id/avatar` - Subir/actualizar foto de perfil (Multipart Form Data).
- `PUT /api/user/password` - Actualización de contraseña (valida la contraseña actual).
- `PUT /api/user/password-change` - Cambio directo de contraseña del usuario autenticado.
- `PUT /api/user/email` - Cambiar dirección de correo electrónico.
- `PUT /api/user/username` - Cambiar nombre de usuario.
- `DELETE /api/user/account` - Eliminar la cuenta del usuario en sesión.
- `GET /api/user/:id` - Obtener información de un usuario por su ID.

### 👑 Endpoints de Administrador (Requieren Rol `Administrador`)
- `GET /api/user/users` - Lista paginada de todos los usuarios registrados.
- `POST /api/user/search` - Búsqueda avanzada y filtrada de usuarios.
- `POST /api/user/export/csv` - Exportar el listado de usuarios filtrados a archivo CSV.
- `POST /api/audit-logs/search` - Búsqueda y filtrado de la bitácora de eventos de auditoría.
- `PUT /api/user/role` - Asignar nuevo rol a un usuario (`Usuario` / `Administrador`).
- `PUT /api/user/status` - Activar o desactivar cuenta de usuario.
- `PUT /api/user/:id` - Actualizar datos de un usuario desde el panel de administración.
- `DELETE /api/user/:id` - Eliminar a un usuario desde el panel de administración.

---

## 🔒 Seguridad y Logging Enmascarado

El proyecto cuenta con un módulo especializado de **Logging con CKM Data Masking** (`internal/logging/masking.go`):
- Oculta automáticamente información confidencial (contraseñas, tokens JWT, correos electrónicos y datos personales) antes de escribirlos en los logs o stdout.
- Utiliza enmascaramiento dinámico (por ejemplo: `usr_****@domain.com` o `****`) mediante reglas y expresiones configurables.
- Formato de logs estructurado con `log/slog` y formateador de color en consola (`lmittmann/tint`).

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos
- **[Go 1.26+](https://golang.org/dl/)**
- **[Node.js 20+]** y **[pnpm](https://pnpm.io/)**
- **[Docker & Docker Compose](https://www.docker.com/)** (para ejecutar PostgreSQL, MinIO y Mailpit)

### 1. Clonar el repositorio y configurar entorno
```bash
git clone https://github.com/yonsina94/go-user-manager.git
cd go-user-manager
cp .env.example .env
```

### 2. Instalar dependencias del Backend y Frontend
```bash
make install
```

### 3. Iniciar el entorno en modo Desarrollo (Full-Stack Hot-Reload)
Este comando ejecuta en paralelo el servidor backend en Go (con live-reload vía Air) y el frontend en React (con HMR vía Vite):
```bash
make dev
```

Si deseas probar la interfaz frontend sin depender de PostgreSQL ni MinIO activos:
```bash
make dev-offline
```

Acceso local:
- **Frontend SPA**: `http://localhost:5173`
- **Backend API Go**: `http://localhost:8080`
- **Mailpit Web UI**: `http://localhost:8025`
- **MinIO Console**: `http://localhost:9001`

---

## 🛠️ Comandos de Makefile

El archivo `Makefile` provee comandos automatizados para facilitar el ciclo de desarrollo y compilación:

| Comando | Descripción |
| :--- | :--- |
| `make install` | Descarga las dependencias de Go, instala paquetes de pnpm y verifica herramientas CLI (`air`, `templ`). |
| `make dev` | Inicia el entorno de desarrollo Full-Stack completo con Hot Reload (Air + Vite). |
| `make dev-offline` | Inicia el entorno de desarrollo en modo OFFLINE (`SKIP_DB_CONNECT=true`). |
| `make build` | Compila el frontend React a `web/`, genera plantillas Templ y construye el ejecutable binario en `bin/server`. |
| `make build-frontend` | Compila únicamente la aplicación frontend SPA a la carpeta `web/`. |
| `make build-backend` | Alias para construir el frontend, generar código Templ y compilar el binario Go. |
| `make run` | Compila el frontend, genera plantillas Templ e inicia el servidor Go directamente. |
| `make run-offline` | Ejecuta el servidor Go en modo offline sin conexión a PostgreSQL. |
| `make run-frontend` | Ejecuta únicamente el servidor de desarrollo Vite del frontend React. |
| `make clean` | Limpia los artefactos generados (`bin/`, `web/`, `tmp/`). |

---

## 🐳 Entorno Docker y DevContainers

El repositorio está preconfigurado para su uso inmediato con **VS Code DevContainers**.

Al abrir el proyecto en VS Code con la extensión *Dev Containers*, se inician automáticamente los siguientes servicios dentro de la red del contenedor:

- **App Container**: Entorno aislado con Go, Node.js, pnpm, Air y herramientas de desarrollo.
- **PostgreSQL**: Base de datos relacional accesible en el puerto `5432`.
- **Mailpit**: Capturador de correos de prueba.
  - SMTP: `localhost:1025`
  - Web UI: `http://localhost:8025`
- **MinIO**: Almacenamiento S3 para fotos de avatar.
  - API S3: `http://localhost:9000`
  - Consola Web: `http://localhost:9001` (Usuario: `minioadmin` / Clave: `minioadminpassword`)

---

## 📄 Licencia

Este proyecto está distribuido bajo los términos de la licencia MIT.

