import { useState } from "react";
import { apiService, type UpdateUserRequest } from "../../../services/api.service";
import { UserForm, type UserFormValues } from "../components/UserForm";
import type { User } from "../types/user";
import { Modal } from "../../../components/ui/Modal";
import { Edit3 } from "lucide-react";

/* Hallmark & vercel-composition-patterns · component: modal · genre: modern-minimal */

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditUserModal = ({ user, isOpen, onClose, onSuccess }: EditUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    if (!user) return null;

    const handleSubmit = async (values: UserFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const payload: UpdateUserRequest = {
                name: values.name,
                lastName: values.lastName,
                email: values.email,
                role: values.role,
                active: values.active ?? true,
            };

            await apiService.updateUser(user.id, payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err || new Error("Error al actualizar el usuario"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <Modal.Header
                title={
                    <>
                        Editar Usuario:{" "}
                        <span className="font-mono text-sm text-[var(--color-ink-2)]">
                            @{user.username}
                        </span>
                    </>
                }
                icon={<Edit3 className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />}
                onClose={onClose}
            />

            <Modal.Body>
                {error && (
                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-xl font-medium">
                        {error.message}
                    </div>
                )}

                <UserForm
                    isEditMode={true}
                    initialValues={{
                        name: user.name,
                        lastName: user.lastname,
                        email: user.email,
                        role: user.role,
                        active: user.active,
                    }}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitText="Actualizar Usuario"
                    loading={loading}
                />
            </Modal.Body>
        </Modal>
    );
};
