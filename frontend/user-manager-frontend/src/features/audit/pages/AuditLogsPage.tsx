import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { apiService } from "../../../services/api.service";
import { AuditAction } from "../types/audit";
import type { AuditLog } from "../types/audit";
import { QueryOperator } from "../../../types/query";
import type { QueryFilter } from "../../../types/query";
import { Pagination } from "../../../components/ui/Pagination";

import { AuditDetailModal } from "../modals/AuditDetailModal";

const ActionBadge = styled.span.attrs<{ $action: AuditAction }>((props) => {
  let colorClasses = "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";

  switch (props.$action) {
    case AuditAction.USER_LOGIN:
    case AuditAction.USER_CREATED:
      colorClasses = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
      break;
    case AuditAction.USER_UPDATED:
    case AuditAction.AVATAR_UPLOADED:
    case AuditAction.PASSWORD_CHANGED:
      colorClasses = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      break;
    case AuditAction.USER_DELETED:
    case AuditAction.USER_LOGIN_FAILED:
      colorClasses = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
      break;
  }

  return {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`,
  };
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📋 Logs de Auditoría
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registro detallado de acciones, seguridad y eventos del sistema
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="🔍 Buscar por correo, IP o detalle..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Evento:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm font-medium cursor-pointer"
          >
            <option value="ALL">Todos los eventos</option>
            <option value={AuditAction.USER_LOGIN}>Login Exitoso</option>
            <option value={AuditAction.USER_LOGIN_FAILED}>Login Fallido</option>
            <option value={AuditAction.USER_CREATED}>Usuario Creado</option>
            <option value={AuditAction.USER_UPDATED}>Usuario Actualizado</option>
            <option value={AuditAction.USER_DELETED}>Usuario Eliminado</option>
            <option value={AuditAction.AVATAR_UPLOADED}>Avatar Actualizado</option>
            <option value={AuditAction.PASSWORD_CHANGED}>Contraseña Cambiada</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabla de Auditoría */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Entidad</th>
                <th className="py-3 px-4">IP</th>
                <th className="py-3 px-4">Detalles</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Cargando logs de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {log.userEmail || "Sistema / Anónimo"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ActionBadge $action={log.action}>{log.action}</ActionBadge>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate" title={log.details}>
                      {log.details || "-"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(log)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
                      >
                        👁️ Ver Detalle
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
