import type { User, UserDTO, UserRole } from "../../users/types/user";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponseDTO {
    user: UserDTO;
    token: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    name: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
