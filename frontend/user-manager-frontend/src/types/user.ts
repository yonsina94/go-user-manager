export const UserRole = {
    USER: "Usuario",
    ADMIN: "Administrador",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// 1. DTO recibido por la red desde el backend en Go
export interface UserDTO {
    id: number;
    name: string;
    lastName: string;
    username: string;
    email: string;
    role: UserRole;
    active: boolean;
    createdAt?: string;
}

// 2. Modelo de dominio utilizado en las vistas del Frontend
export interface User {
    id: number;
    name: string;
    lastname: string;
    username: string;
    email: string;
    role: UserRole;
    active: boolean;
    createAt: Date;
}