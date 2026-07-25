import { useState } from "react";
import { apiService } from "../../../services/api.service";
import { UserForm, type UserFormValues } from "../components/UserForm";
import type { RegisterRequest } from "../../auth/types/auth.types";
import { X, UserPlus } from "lucide-react";

/* Hallmark · component: modal · genre: modern-minimal · design-system: design.md */

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (values: UserFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const payload: RegisterRequest = {
                name: values.name,
                lastName: values.lastName,
                username: values.username || "",
                email: values.email,
                password: values.password || "",
                role: values.role,
            };

            await apiService.register(payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err || new Error("Error al crear el usuario"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-6 text-left">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[var(--color-rule)] pb-4">
                    <div className="flex items-center space-x-2.5">
                        <UserPlus className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] tracking-tight">
                            Crear Nuevo Usuario
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 stroke-[1.75]" />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-xl font-medium">
                        {error.message}
                    </div>
                )}

                {/* Reusable Form */}
                <UserForm
                    isEditMode={false}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitText="Crear Usuario"
                    loading={loading}
                />
            </div>
        </div>
    );
};

