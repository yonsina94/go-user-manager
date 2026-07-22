import styled from "styled-components";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import type { User } from "./types/user";
import { useEffect, useState, useCallback } from "react";
import { apiService } from "./services/api.service";
import { useAuth } from "./context/auth.context";
import { LoginPage } from "./pages/login/Login.page";
import { ProtectedRoute } from "./components/protected.route";

import { CreateUserModal } from "./components/modal/createUser.modal";
import { EditUserModal } from "./components/modal/editUser.modal";
import { QueryOperator, type QueryFilter } from "./types/query";
import { UserRole } from "./types/user";

const StatusBadge = styled.span.attrs<{ $active: boolean }>((props) => ({                     
  className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border      
transition-colors ${                                                                            
    props.$active                                                                             
      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"              
      : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"                      
  }`,                                                                                         
}))``;                                                                                        

const Card = styled.div.attrs({                                                               
  className: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300",                                                                   
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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Estados para filtros dinámicos
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("createdAt_DESC");

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Función de búsqueda dinámica usando el QueryFilter pattern
  const executeFilter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: QueryFilter = {
        filters: {},
        orderBy: {},
      };

      // Filtro exacto por Rol
      if (roleFilter !== "ALL") {
        filter.filters!["role"] = roleFilter;
      }

      // Filtro exacto por Estado
      if (statusFilter === "ACTIVE") {
        filter.filters!["active"] = true;
      } else if (statusFilter === "INACTIVE") {
        filter.filters!["active"] = false;
      }

      // Búsqueda por texto (Search OR entre nombre, apellido, username y email)
      if (searchQuery.trim()) {
        filter.search = {
          or: {
            name: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
            lastName: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
            username: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
            email: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
          },
        };
      }

      // Ordenamiento dinámico
      const [sortField, sortDir] = sortOrder.split("_");
      filter.orderBy![sortField] = { order: sortDir };

      const resp = await apiService.searchUsers(filter);
      if (resp.data) {
        setUsers(resp.data.items);
        setTotalCount(resp.data.total);
      }
    } catch (err: any) {
      setError(err.message || new Error("Error al filtrar usuarios"));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, sortOrder]);

  useEffect(() => {
    executeFilter();
  }, [executeFilter]);

  const handleDeleteUser = async (user: User) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.name} ${user.lastname}"?`)) {
      try {
        await apiService.deleteUser(user.id);
        executeFilter();
      } catch (err: any) {
        alert(err.message || "Error al eliminar el usuario");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header y Botón Nuevo Usuario */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuarios ({totalCount})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión y búsqueda dinámica de usuarios en el sistema.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 cursor-pointer self-start md:self-auto"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Toolbar de Filtros Dinámicos */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Input de Búsqueda por Texto */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Selector de Rol */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL">Todos los Roles</option>
            <option value={UserRole.USER}>Usuario</option>
            <option value={UserRole.ADMIN}>Administrador</option>
          </select>

          {/* Selector de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>

          {/* Selector de Ordenamiento */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="createdAt_DESC">Más recientes primero</option>
            <option value="createdAt_ASC">Más antiguos primero</option>
            <option value="name_ASC">Nombre (A-Z)</option>
            <option value="name_DESC">Nombre (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Cargando o Error */}
      {loading && <div className="text-left text-gray-500">Cargando usuarios...</div>}
      {error && <div className="text-left text-red-500">{error.message}</div>}

      {/* Grid de Tarjetas de Usuarios */}
      {!loading && !error && users.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
          No se encontraron usuarios con los filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} $isHoverable>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                    {user.name} {user.lastname}
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

              {/* Acciones: Editar y Eliminar */}
              <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-1.5 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
                  title="Editar usuario"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="p-1.5 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  title="Eliminar usuario"
                >
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para Crear Usuario */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={executeFilter}
      />

      {/* Modal para Editar Usuario */}
      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={executeFilter}
      />
    </div>
  );
};

const SettingsPage = () => {                                                                  
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
            </div>                                                                                
          </Card>                                                                                 
        </div>                                                                                    
      );                                                                                          
    }; 

     // Layout Principal con Sidebar                                                                                                                      
    const DashboardLayout = () => {                                                                                                                      
      const { user, logout } = useAuth();                                                                                                                
      const navigate = useNavigate();                                                                                                                    
                                                                                                                                                         
      const handleLogout = () => {                                                                                                                       
        logout();                                                                                                                                        
        navigate("/login");                                                                                                                              
      };                                                                                                                                                 
                                                                                                                                                         
      return (                                                                                                                                           
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
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100     
  dark:hover:bg-gray-800 transition-colors"                                                                                                              
              >                                                                                                                                          
                <span>👥</span>                                                                                                                          
                <span>Usuarios</span>                                                                                                                    
              </Link>                                                                                                                                    
              <Link                                                                                                                                      
                to="/settings"                                                                                                                           
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100     
  dark:hover:bg-gray-800 transition-colors"                                                                                                              
              >                                                                                                                                          
                <span>⚙️</span>                                                                                                                          
                <span>Configuración</span>                                                                                                               
              </Link>                                                                                                                                    
            </nav>                                                                                                                                       
                                                                                                                                                         
            {/* Info de Usuario Logueado & Logout */}                                                                                                    
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto flex items-center justify-between">                                
              <div className="flex items-center space-x-3">                                                                                              
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-semibold     
  uppercase">                                                                                                                                            
                  {user?.name?.[0] || "U"}                                                                                                               
                </div>                                                                                                                                   
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name} {user?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
  
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                🚪
              </button>
            </div>
          </aside>
  
          {/* Área Principal */}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
          </main>
        </div>
      );
    };
  
    export const App = () => {
      return (
        <BrowserRouter>
          <Routes>
            {/* Ruta Pública de Login */}
            <Route path="/login" element={<LoginPage />} />
  
            {/* Rutas Protegidas que requieren estar logueado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<DashboardLayout />} />
            </Route>
          </Routes>
        </BrowserRouter>
      );
    };