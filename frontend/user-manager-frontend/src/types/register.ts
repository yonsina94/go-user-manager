import type { UserRole } from "./user";

export interface RegisterRequest {
    name: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
}