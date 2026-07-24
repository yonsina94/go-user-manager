import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { UserRole, type User } from "../../types/user";
import { QueryOperator, type QueryFilter } from "../../types/query";
import { apiService } from "../../services/api.service";
import { CreateUserModal } from "../../components/modal/createUser.modal";
import { EditUserModal } from "../../components/modal/editUser.modal";
import { UserAvatar } from "../../components/avatar/user/user.avatar";
import { useAuth } from "../../context/auth.context";

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

export const UsersPage = () => {
  const { user: currentUser, refreshUser } = useAuth();
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
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    email={user.email}
                    name={user.name}
                    size={48}
                    editable={true}
                    onAvatarUpload={async (file) => {
                      const res = await apiService.uploadUserAvatar(user.id, file);
                      executeFilter();
                      if (currentUser?.id === user.id) {
                        await refreshUser();
                      }
                      return res.data?.avatarUrl;
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                      {user.name} {user.lastname}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {user.email}
                    </p>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
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