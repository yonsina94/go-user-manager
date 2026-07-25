import { useState, useEffect } from "react";
import styled from "styled-components";
import { UserRole } from "../types/user";

export interface UserFormValues {
    name: string;
    lastName: string;
    username?: string;
    email: string;
    password?: string;
    role: UserRole;
    active?: boolean;
}

interface UserFormProps {
    initialValues?: Partial<UserFormValues>;
    isEditMode?: boolean;
    onSubmit: (formData: UserFormValues) => Promise<void>;
    onCancel: () => void;
    submitText?: string;
    loading?: boolean;
}

/* Hallmark · component: form · genre: modern-minimal · design-system: design.md */

export const FormLabel = styled.label.attrs({
    className: "block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5 text-left",
})``;

export const FormInput = styled.input.attrs({
    className:
        "w-full px-3.5 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors",
})``;

export const FormSelect = styled.select.attrs({
    className:
        "w-full px-3.5 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors cursor-pointer",
})``;

export const Button = styled.button.attrs<{ $variant?: "primary" | "secondary" }>((props) => ({
    className: `px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-colors duration-150 cursor-pointer ${
        props.$variant === "secondary"
            ? "border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
            : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-ink)] disabled:opacity-50"
    }`,
}))``;

const defaultState: UserFormValues = {
    name: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: UserRole.USER,
    active: true,
};

export const UserForm = ({
    initialValues,
    isEditMode = false,
    onSubmit,
    onCancel,
    submitText = "Guardar",
    loading = false,
}: UserFormProps) => {
    const [formData, setFormData] = useState<UserFormValues>({ ...defaultState, ...initialValues });

    useEffect(() => {
        if (initialValues) {
            setFormData((prev) => ({ ...prev, ...initialValues }));
        }
    }, [initialValues]);

    const handleChange = (field: keyof UserFormValues, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <form action={handleSubmit} className="space-y-4 text-left">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FormLabel>Nombre</FormLabel>
                    <FormInput
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Ej: Juan"
                    />
                </div>
                <div>
                    <FormLabel>Apellido</FormLabel>
                    <FormInput
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        placeholder="Ej: Pérez"
                    />
                </div>
            </div>

            {!isEditMode && (
                <div>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormInput
                        type="text"
                        required
                        value={formData.username || ""}
                        onChange={(e) => handleChange("username", e.target.value)}
                        placeholder="Ej: jperez"
                    />
                </div>
            )}

            <div>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormInput
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="juan@example.com"
                />
            </div>

            {!isEditMode && (
                <div>
                    <FormLabel>Contraseña</FormLabel>
                    <FormInput
                        type="password"
                        required
                        minLength={6}
                        value={formData.password || ""}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FormLabel>Rol del Usuario</FormLabel>
                    <FormSelect
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value as UserRole)}
                    >
                        <option value={UserRole.USER}>Usuario</option>
                        <option value={UserRole.ADMIN}>Administrador</option>
                    </FormSelect>
                </div>

                {isEditMode && (
                    <div>
                        <FormLabel>Estado</FormLabel>
                        <FormSelect
                            value={formData.active ? "true" : "false"}
                            onChange={(e) => handleChange("active", e.target.value === "true")}
                        >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </FormSelect>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button type="button" $variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" $variant="primary" disabled={loading}>
                    {loading ? "Procesando..." : submitText}
                </Button>
            </div>
        </form>
    );
};
