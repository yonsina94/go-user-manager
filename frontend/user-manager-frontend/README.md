# ⚛️ Go User Manager - Frontend

[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

Este directorio contiene la aplicación frontend SPA (Single Page Application) desarrollada con **React 19**, **TypeScript** y **Vite**.

---

## 🏗️ Arquitectura de Carpetas: Feature-First (Vertical Slices)

El frontend está estructurado siguiendo la arquitectura **Feature-First (orientada a dominios)** para garantizar máxima modularidad, aislamiento y escalabilidad.

```
src/
├── assets/                    # Archivos estáticos globales (imágenes, iconos)
├── components/                # Componentes UI agnósticos al dominio (Design System)
│   └── ui/                    # UserAvatar, botones, inputs globales
├── context/                   # Contextos globales (ThemeContext - Auto Dark Mode)
├── features/                  # 🚀 Módulos independientes de negocio
│   ├── auth/                  # Módulo de Autenticación
│   │   ├── context/           # AuthContext & AuthProvider
│   │   ├── pages/             # LoginPage, RecoverPasswordPage (React 19 Form Actions)
│   │   └── types/             # auth.types.ts
│   ├── users/                 # Módulo de Gestión de Usuarios
│   │   ├── components/        # UserForm
│   │   ├── mappers/           # user.mapper.ts
│   │   ├── modals/            # CreateUserModal, EditUserModal
│   │   ├── pages/             # UsersPage
│   │   └── types/             # user.ts
│   └── settings/              # Módulo de Configuración
│       └── pages/             # SettingsPage (Selector de Tema)
├── layouts/                   # Layouts principales de navegación (DashboardLayout - Mobile Drawer + Sidebar)
├── routes/                    # Configuración de enrutamiento y guardias (ProtectedRoute)
├── services/                  # Cliente API HTTP e interceptores (api.service.ts)
├── types/                     # Tipos globales de API (query.ts, response.ts)
├── utils/                     # Utilidades (gravatar.ts)
├── App.tsx                    # Enrutador principal de la aplicación
├── main.tsx                   # Punto de entrada de React con ThemeProvider
└── index.css                  # Estilos globales, tokens OKLCH y Tailwind CSS v4
```

---

## 🛠️ Tecnologías y Librerías

- **React 19**: Form Actions nativos (`action={...}`), concurrencia (`useTransition`) y compilador automático.
- **TypeScript 6**: Tipado estático estricto para garantizar seguridad en tiempo de desarrollo.
- **Vite 8**: Servidor de desarrollo con Hot Module Replacement (HMR) ultrarrápido y bundler de producción.
- **Tailwind CSS v4 & Styled Components**: Estilizado dinámico con tokens OKLCH y soporte para modo oscuro automático.
- **Lucide React**: Iconografía vectorial para evitar emojis del sistema operativo.
- **Google Fonts**: *Space Grotesk* (encabezados de exhibición), *Inter* (cuerpo de texto) y *JetBrains Mono* (código).
- **React Router DOM v7**: Enrutamiento declarativo del lado del cliente.
- **Oxlint**: Linter ultrarrápido configurado para React y TypeScript.



---

## 🚀 Comandos de Desarrollo

### Instalar Dependencias
```bash
pnpm install
```

### Servidor de Desarrollo (Vite HMR)
```bash
pnpm dev
```
Accede a la aplicación en `http://localhost:5173`.

### Compilación para Producción
```bash
pnpm build
```
Compila el bundle estático en la carpeta `../../web/`, el cual es embebido directamente por el backend de Go mediante `go:embed`.

### Linter (Oxlint)
```bash
pnpm lint
```

### Previsualizar Build de Producción
```bash
pnpm preview
```
