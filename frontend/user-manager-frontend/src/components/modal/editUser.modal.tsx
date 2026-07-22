import { useState } from "react";
import { apiService, type UpdateUserRequest } from "../../services/api.service";
import { UserForm, type UserFormValues } from "../form/UserForm";
import type { User } from "../../types/user";

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditUserModal = ({ user, isOpen, onClose, onSuccess }: EditUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    if (!isOpen || !user) return null;

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-left animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                    <h3 className="text-xl font-bold text-gray-950 dark:text-gray-50">
                        Editar Usuario: {user.username}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-semibold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error.message}
                    </div>
                )}

                {/* Reusable Form */}
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
            </div>
        </div>
    );
};