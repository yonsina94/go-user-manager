import { createPortal } from "react-dom";
import styled from "styled-components";
import type { AuditLog } from "../types/audit";
import { AuditAction, AuditStatus } from "../types/audit";
import { X, Code, Globe, Shield, User, Terminal } from "lucide-react";

/* Hallmark · component: modal · genre: modern-minimal · design-system: design.md */

interface AuditDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorClasses}`,
  };
})``;

const StatusBadge = styled.span.attrs<{ $status?: AuditStatus }>((props) => ({
  className: `inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
    props.$status === AuditStatus.FAILED
      ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/30"
      : "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/30"
  }`,
}))``;

export const AuditDetailModal = ({ log, isOpen, onClose }: AuditDetailModalProps) => {
  if (!isOpen || !log) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-modal-backdrop">
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto text-left animate-modal-card">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-[var(--color-rule)] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <ActionBadge $action={log.action}>{log.action}</ActionBadge>
              <StatusBadge $status={log.status}>{log.status || AuditStatus.SUCCESS}</StatusBadge>
            </div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)] flex items-center gap-2 tracking-tight">
              <Shield className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
              <span>Detalle del Evento de Auditoría #{log.id}</span>
            </h2>
            <p className="text-xs font-mono text-[var(--color-ink-2)]">
              Ocurrió el {formatDate(log.createdAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Rejilla de Información Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Usuario y Rol */}
          <div className="p-3.5 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] space-y-1">
            <span className="text-[var(--color-ink-2)] font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <User className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" /> Usuario Responsable
            </span>
            <p className="font-semibold text-[var(--color-ink)] text-sm truncate">
              {log.userEmail || "Sistema / Anónimo"}
            </p>
            {log.userId && (
              <p className="text-[var(--color-ink-2)] font-mono">ID de Usuario: #{log.userId}</p>
            )}
          </div>

          {/* Endpoint HTTP */}
          <div className="p-3.5 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] space-y-1">
            <span className="text-[var(--color-ink-2)] font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" /> Petición Servidor
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-[var(--color-paper)] text-[var(--color-accent)] border border-[var(--color-rule)]">
                {log.method || "POST"}
              </span>
              <span className="font-mono text-[var(--color-ink)] truncate">
                {log.path || "/api/user/search"}
              </span>
            </div>
            <p className="text-[var(--color-ink-2)] font-mono text-[11px]">
              Entidad: {log.entity} {log.entityId ? `(#${log.entityId})` : ""}
            </p>
          </div>

          {/* Origen e IP */}
          <div className="p-3.5 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] space-y-1 md:col-span-2">
            <span className="text-[var(--color-ink-2)] font-medium flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Globe className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" /> Conexión y Cliente
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="font-mono font-semibold text-[var(--color-ink)]">
                IP Address: {log.ipAddress || "127.0.0.1"}
              </p>
              <p className="text-[var(--color-ink-2)] font-mono text-[11px] truncate max-w-md" title={log.userAgent}>
                {log.userAgent || "Browser Client"}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles en Lenguaje Natural */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)]">
            Descripción del Evento
          </h3>
          <div className="p-3.5 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-sm text-[var(--color-ink)] font-medium">
            {log.details || "Sin descripción adicional."}
          </div>
        </div>

        {/* Visor JSON de Payload Struct */}
        {formattedPayload && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" /> Metadata & Snapshot JSON (Payload)
            </h3>
            <div className="p-4 rounded-xl bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-[var(--color-rule)] shadow-inner">
              <pre>{formattedPayload}</pre>
            </div>
          </div>
        )}

        {/* Pie de Modal */}
        <div className="pt-3 flex justify-end border-t border-[var(--color-rule)]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

