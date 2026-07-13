import styled from "styled-components";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

// Combinación de styled-components y Tailwind CSS para un badge de estado dinámico
const StatusBadge = styled.span.attrs<{ $active: boolean }>((props) => ({
  className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
    props.$active
      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
      : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
  }`,
}))``;

// Tarjeta que combina Tailwind CSS para la base y styled-components para efectos dinámicos interactivos
const Card = styled.div.attrs({
  className:
    "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300",
})<{ $isHoverable?: boolean }>`
  ${(props) =>
    props.$isHoverable &&
    `
    &:hover {
      transform: translateY(-2px);
      border-color: var(--accent, #a855f7);
      box-shadow: 0 10px 20px -10px var(--accent-border, rgba(168, 85, 247, 0.3));
    }
  `}
`;

function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Yansi",
      email: "yansi@example.com",
      role: "Administrador",
      active: true,
    },
    {
      id: 2,
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Usuario",
      active: true,
    },
    {
      id: 3,
      name: "Ana Gómez",
      email: "ana@example.com",
      role: "Editor",
      active: false,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuarios
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona los usuarios registrados en el sistema.
          </p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 cursor-pointer">
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} $isHoverable>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {user.email}
                </p>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
              <StatusBadge $active={user.active}>
                {user.active ? "Activo" : "Inactivo"}
              </StatusBadge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Configuración
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Configura los parámetros globales del sistema.
      </p>

      <Card className="max-w-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ajustes Generales
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Sitio
            </label>
            <input
              type="text"
              defaultValue="User Manager Dashboard"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notificaciones
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked
                id="notify"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <label
                htmlFor="notify"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Recibir alertas por correo electrónico
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-gray-50 m-0 flex items-center space-x-2">
              <span className="text-purple-600">⚡</span>
              <span>GoUserManager</span>
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/users"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>👥</span>
              <span>Usuarios</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>⚙️</span>
              <span>Configuración</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-semibold">
                Y
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yansi
                </p>
                <p className="text-xs text-gray-500">Developer</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
