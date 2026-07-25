import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { apiService } from "../../../services/api.service";
import { AuditAction } from "../types/audit";
import type { AuditLog } from "../types/audit";
import { QueryOperator } from "../../../types/query";
import type { QueryFilter } from "../../../types/query";
import { Pagination } from "../../../components/ui/Pagination";
import { AuditDetailModal } from "../modals/AuditDetailModal";
import { ShieldCheck, Search, Eye, Filter } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

const ActionBadge = styled.span.attrs<{ $action: AuditAction }>((props) => {
  let colorClasses = "bg-[var(--color-paper-3)] text-[var(--color-ink-2)] border-[var(--color-rule)]";

  switch (props.$action) {
    case AuditAction.USER_LOGIN:
    case AuditAction.USER_CREATED:
      colorClasses = "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/30";
      break;
    case AuditAction.USER_UPDATED:
    case AuditAction.AVATAR_UPLOADED:
    case AuditAction.PASSWORD_CHANGED:
      colorClasses = "bg-[var(--color-paper-3)] text-[var(--color-accent)] border-[var(--color-accent)]/30";
      break;
    case AuditAction.USER_DELETED:
    case AuditAction.USER_LOGIN_FAILED:
      colorClasses = "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/30";
      break;
  }

  return {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`,
  };
})``;

const FormSelect = styled.select.attrs({
  className:
    "px-3.5 py-2 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors cursor-pointer",
})``;

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de Detalles
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filtros y Paginación
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: QueryFilter = {
        pagination: {
          page: page,
          length: pageSize,
        },
        filters: {},
        orderBy: {
          createdAt: { order: "DESC" },
        },
      };

      if (actionFilter !== "ALL") {
        filter.filters!["action"] = actionFilter;
      }

      if (searchQuery.trim()) {
        filter.search = {
          or: {
            userEmail: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
            details: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
            ipAddress: { operator: QueryOperator.CONTAINS, value: searchQuery.trim() },
          },
        };
      }

      const response = await apiService.searchAuditLogs(filter);
      if (response.data) {
        setLogs(response.data.items || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los logs de auditoría");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, searchQuery]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-[var(--color-accent)] stroke-[2]" />
            <span>Logs de Auditoría</span>
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] mt-0.5">
            Registro detallado de acciones, seguridad y eventos del sistema.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
          <input
            type="text"
            placeholder="Buscar por correo, IP o detalle..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[var(--color-ink-2)] stroke-[1.75]" />
          <span className="text-xs text-[var(--color-ink-2)] font-semibold uppercase tracking-wider">Evento:</span>
          <FormSelect
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Todos los eventos</option>
            <option value={AuditAction.USER_LOGIN}>Login Exitoso</option>
            <option value={AuditAction.USER_LOGIN_FAILED}>Login Fallido</option>
            <option value={AuditAction.USER_CREATED}>Usuario Creado</option>
            <option value={AuditAction.USER_UPDATED}>Usuario Actualizado</option>
            <option value={AuditAction.USER_DELETED}>Usuario Eliminado</option>
            <option value={AuditAction.AVATAR_UPLOADED}>Avatar Actualizado</option>
            <option value={AuditAction.PASSWORD_CHANGED}>Contraseña Cambiada</option>
          </FormSelect>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl border bg-[var(--color-danger-bg)] border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabla de Auditoría */}
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-ink-2)] border-collapse">
            <thead className="bg-[var(--color-paper-3)] border-b border-[var(--color-rule)] text-xs uppercase font-semibold text-[var(--color-ink-2)]">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Acción</th>
                <th className="py-3.5 px-4">Entidad</th>
                <th className="py-3.5 px-4">IP</th>
                <th className="py-3.5 px-4">Detalles</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-ink-2)]">
                    Cargando logs de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-ink-2)]">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-paper-3)]/50 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-[var(--color-ink-2)] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--color-ink)] whitespace-nowrap">
                      {log.userEmail || "Sistema / Anónimo"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ActionBadge $action={log.action}>{log.action}</ActionBadge>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[var(--color-ink-2)] whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[var(--color-ink-2)] whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--color-ink-2)] max-w-xs truncate" title={log.details}>
                      {log.details || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(log)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)] transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>

      {/* Modal de Detalle Extendido */}
      <AuditDetailModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
};

