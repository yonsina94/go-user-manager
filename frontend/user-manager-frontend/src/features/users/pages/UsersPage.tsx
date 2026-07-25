import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { UserRole, type User } from "../types/user";
import { QueryOperator, type QueryFilter } from "../../../types/query";
import { apiService } from "../../../services/api.service";
import { CreateUserModal } from "../modals/CreateUserModal";
import { EditUserModal } from "../modals/EditUserModal";
import { DeleteUserModal } from "../modals/DeleteUserModal";
import { UserAvatar } from "../../../components/ui/UserAvatar";
import { useAuth } from "../../auth/context/AuthContext";
import { Pagination } from "../../../components/ui/Pagination";
import { Search, UserPlus, Edit3, Trash2, Shield, User as UserIcon, CheckCircle2, XCircle, Download } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

const StatusBadge = styled.span.attrs<{ $active: boolean }>((props) => ({
  className: `inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
    props.$active
      ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/30"
      : "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/30"
  }`,
}))``;

const Card = styled.div.attrs({
  className: "bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-5 transition-all duration-200 hover:border-[var(--color-accent)]/50",
})``;

export const UsersPage = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Estados de la paginacion
   const [page, setPage] = useState<number>(1);
   const [pageSize, setPageSize] = useState<number>(10);

  // Estados para filtros dinámicos
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("createdAt_DESC");

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [exportingCSV, setExportingCSV] = useState<boolean>(false);

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const filter: QueryFilter = {
        filters: {},
        orderBy: {},
      };

      if (roleFilter !== "ALL") {
        filter.filters!["role"] = roleFilter;
      }
      if (statusFilter === "ACTIVE") {
        filter.filters!["active"] = true;
      } else if (statusFilter === "INACTIVE") {
        filter.filters!["active"] = false;
      }
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

      const [sortField, sortDir] = sortOrder.split("_");
      filter.orderBy![sortField] = { order: sortDir };

      const blob = await apiService.exportUsersCSV(filter);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `usuarios_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || new Error("Error al exportar los usuarios a CSV"));
    } finally {
      setExportingCSV(false);
    }
  };

  // Función de búsqueda dinámica usando el QueryFilter pattern
  const executeFilter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

     const filter: QueryFilter = {
      pagination: {
        page: page,
        length: pageSize,
      },
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
  }, [searchQuery, roleFilter, statusFilter, sortOrder, page, pageSize]);

  useEffect(() => {
    executeFilter();
  }, [executeFilter]);

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header y Botones de Acción */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight">
            Usuarios ({totalCount})
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] mt-0.5">
            Gestión centralizada y búsqueda dinámica de cuentas de usuario.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule)] font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>{exportingCSV ? "Exportando..." : "Exportar CSV"}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-ink)] font-semibold text-sm rounded-xl shadow-sm transition-colors duration-150 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2]" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Toolbar de Filtros Dinámicos */}
      <div className="bg-[var(--color-paper-2)] p-4 rounded-2xl border border-[var(--color-rule)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Input de Búsqueda por Texto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email..."
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setPage(1);}}
              className="w-full pl-10 pr-3.5 py-2 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
            />
          </div>

          {/* Selector de Rol */}
          <select
            value={roleFilter}
            onChange={(e) => {setRoleFilter(e.target.value); setPage(1);}}
            className="w-full px-3.5 py-2 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="ALL">Todos los Roles</option>
            <option value={UserRole.USER}>Usuario</option>
            <option value={UserRole.ADMIN}>Administrador</option>
          </select>

          {/* Selector de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
            className="w-full px-3.5 py-2 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>

          {/* Selector de Ordenamiento */}
          <select
            value={sortOrder}
            onChange={(e) => {setSortOrder(e.target.value); setPage(1);}}
            className="w-full px-3.5 py-2 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="createdAt_DESC">Más recientes primero</option>
            <option value="createdAt_ASC">Más antiguos primero</option>
            <option value="name_ASC">Nombre (A-Z)</option>
            <option value="name_DESC">Nombre (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Cargando o Error */}
      {loading && <div className="text-left text-[var(--color-ink-2)] text-sm">Cargando usuarios...</div>}
      {error && <div className="text-left text-[var(--color-danger)] text-sm">{error.message}</div>}

      {/* Grid de Tarjetas de Usuarios */}
      {!loading && !error && users.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-ink-2)] border border-dashed border-[var(--color-rule)] rounded-2xl">
          No se encontraron usuarios con los filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    email={user.email}
                    name={user.name}
                    size={68}
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
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-base text-[var(--color-ink)] truncate">
                      {user.name} {user.lastname}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-2)] truncate mb-1.5">
                      {user.email}
                    </p>
                    <span className="inline-flex items-center space-x-1 text-xs font-mono font-medium bg-[var(--color-paper-3)] text-[var(--color-ink-2)] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {user.role === UserRole.ADMIN ? (
                        <Shield className="w-3 h-3 text-[var(--color-accent)] stroke-[2]" />
                      ) : (
                        <UserIcon className="w-3 h-3 stroke-[2]" />
                      )}
                      <span>{user.role}</span>
                    </span>
                  </div>
                </div>
                <StatusBadge $active={user.active}>
                  {user.active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 stroke-[2.2]" />
                      <span>Activo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 stroke-[2.2]" />
                      <span>Inactivo</span>
                    </>
                  )}
                </StatusBadge>
              </div>

              {/* Acciones: Editar y Eliminar */}
              <div className="flex justify-end space-x-1 mt-4 pt-3 border-t border-[var(--color-rule)]">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-2 text-[var(--color-ink-2)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-3)] rounded-lg transition-colors cursor-pointer"
                  title="Editar usuario"
                >
                  <Edit3 className="w-4 h-4 stroke-[1.75]" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="p-2 text-[var(--color-ink-2)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors cursor-pointer"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4 stroke-[1.75]" />
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

      {/* Modal para Eliminar Usuario */}
      <DeleteUserModal
        user={userToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onSuccess={executeFilter}
      />


        <Pagination
      currentPage={page}
      pageSize={pageSize}
      totalItems={totalCount}
      onPageChange={(newPage) => setPage(newPage)}
      onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
    />
    </div>
  );
};
