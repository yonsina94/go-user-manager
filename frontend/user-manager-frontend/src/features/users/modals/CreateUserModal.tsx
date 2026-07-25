import { useState } from "react";
import { apiService } from "../../../services/api.service";
import { UserForm, type UserFormValues } from "../components/UserForm";
import type { RegisterRequest } from "../../auth/types/auth.types";
import { Modal } from "../../../components/ui/Modal";
import { UserPlus } from "lucide-react";

/* Hallmark & vercel-composition-patterns · component: modal · genre: modern-minimal */

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

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
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <Modal.Header
                title="Crear Nuevo Usuario"
                icon={<UserPlus className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />}
                onClose={onClose}
            />

            <Modal.Body>
                {error && (
                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-xl font-medium">
                        {error.message}
                    </div>
                )}

                <UserForm
                    isEditMode={false}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitText="Crear Usuario"
                    loading={loading}
                />
            </Modal.Body>
        </Modal>
    );
};
