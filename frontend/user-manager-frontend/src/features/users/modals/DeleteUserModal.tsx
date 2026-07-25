import { useState, useTransition } from "react";
import { apiService } from "../../../services/api.service";
import type { User } from "../types/user";
import { UserAvatar } from "../../../components/ui/UserAvatar";
import { Trash2, AlertTriangle, X } from "lucide-react";

/* Hallmark · component: modal · genre: modern-minimal · design-system: design.md */

interface DeleteUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteUserModal = ({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<Error | null>(null);

    if (!isOpen || !user) return null;

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            try {
                await apiService.deleteUser(user.id);
                onSuccess();
                onClose();
            } catch (err: any) {
                setError(err || new Error("Ocurrió un error al eliminar el usuario"));
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-6 text-left animate-modal-card">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[var(--color-rule)] pb-4">
                    <div className="flex items-center space-x-2.5 text-[var(--color-danger)]">
                        <Trash2 className="w-5 h-5 stroke-[2]" />
                        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] tracking-tight">
                            Eliminar Usuario
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-1 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 stroke-[1.75]" />
                    </button>
                </div>

                {/* Body Details */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3.5 p-3.5 bg-[var(--color-paper-3)] rounded-xl border border-[var(--color-rule)]">
                        <UserAvatar
                            avatarUrl={user.avatarUrl}
                            email={user.email}
                            name={user.name}
                            size={58}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                                {user.name} {user.lastname}
                            </p>
                            <p className="text-xs text-[var(--color-ink-2)] truncate font-mono">
                                @{user.username} • {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-xs rounded-xl flex items-start space-x-2.5 leading-relaxed font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2] mt-0.5" />
                        <span>
                            ¿Estás seguro de que deseas eliminar esta cuenta? Esta acción es irreversible y eliminará de forma permanente los datos del usuario.
                        </span>
                    </div>

                    {error && (
                        <div className="p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-xs rounded-xl font-medium">
                            {error.message}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <form action={handleDelete} className="flex justify-end space-x-3 pt-4 border-t border-[var(--color-rule)]">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] font-semibold text-sm transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-danger)] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-opacity cursor-pointer flex items-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                        <span>{isPending ? "Eliminando..." : "Sí, Eliminar Usuario"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
