import type { User, UserDTO } from "./user";

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