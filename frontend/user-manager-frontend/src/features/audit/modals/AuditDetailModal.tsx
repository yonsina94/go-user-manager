import styled from "styled-components";
import type { AuditLog } from "../types/audit";
import { AuditAction, AuditStatus } from "../types/audit";
import { Modal } from "../../../components/ui/Modal";
import { Code, Globe, Shield, User, Terminal } from "lucide-react";

/* Hallmark & vercel-composition-patterns · component: modal · genre: modern-minimal */

interface AuditDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorClasses}`,
  };
})``;

const StatusBadge = styled.span.attrs<{ $status?: AuditStatus }>((props) => ({
  className: `inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
    props.$status === AuditStatus.FAILED
      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
  }`,
}))``;

export const AuditDetailModal = ({ log, isOpen, onClose }: AuditDetailModalProps) => {
  if (!log) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatJSON = (jsonStr?: string) => {
    if (!jsonStr) return null;
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  const formattedPayload = formatJSON(log.payload);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <Modal.Header
        title={
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <ActionBadge $action={log.action}>{log.action}</ActionBadge>
              <StatusBadge $status={log.status}>{log.status || AuditStatus.SUCCESS}</StatusBadge>
            </div>
            <div className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
              Detalle del Evento de Auditoría #{log.id}
            </div>
          </div>
        }
        subtitle={`Ocurrió el ${formatDate(log.createdAt)}`}
        icon={<Shield className="w-5 h-5 text-purple-600 stroke-[2]" />}
        onClose={onClose}
      />

      <Modal.Body className="space-y-6">
        {/* Rejilla de Información Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Usuario y Rol */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <User className="w-3.5 h-3.5 text-purple-500" /> Usuario Responsable
            </span>
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {log.userEmail || "Sistema / Anónimo"}
            </p>
            {log.userId && (
              <p className="text-gray-500 font-mono">ID de Usuario: #{log.userId}</p>
            )}
          </div>

          {/* Endpoint HTTP */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-purple-500" /> Petición Servidor
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {log.method || "POST"}
              </span>
              <span className="font-mono text-gray-700 dark:text-gray-300 truncate">
                {log.path || "/api/user/search"}
              </span>
            </div>
            <p className="text-gray-500 font-mono text-[11px]">
              Entidad: {log.entity} {log.entityId ? `(#${log.entityId})` : ""}
            </p>
          </div>

          {/* Origen e IP */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 space-y-1 md:col-span-2">
            <span className="text-gray-400 font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Globe className="w-3.5 h-3.5 text-purple-500" /> Conexión y Cliente
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                IP Address: {log.ipAddress || "127.0.0.1"}
              </p>
              <p className="text-gray-500 font-mono text-[11px] truncate max-w-md" title={log.userAgent}>
                {log.userAgent || "Browser Client"}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles en Lenguaje Natural */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Descripción del Evento
          </h3>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 text-sm text-gray-800 dark:text-gray-200 font-medium">
            {log.details || "Sin descripción adicional."}
          </div>
        </div>

        {/* Visor JSON de Payload Struct */}
        {formattedPayload && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-purple-500" /> Metadata & Snapshot JSON (Payload)
            </h3>
            <div className="p-4 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
              <pre>{formattedPayload}</pre>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Cerrar Detalle
        </button>
      </Modal.Footer>
    </Modal>
  );
};
