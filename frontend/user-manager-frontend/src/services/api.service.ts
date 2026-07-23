import type { LoginRequest, LoginResponse, LoginResponseDTO } from "../types/login";
import type { ApiResponse } from "../types/response";
import type { User, UserDTO, UserRole } from "../types/user";
import { mapUserDtoToUser, mapUserDtosToUsers } from "../mappers/user.mapper";
import type { RegisterRequest } from "../types/register";
import type { QueryFilter, SearchResponse } from "../types/query";
import type { ForgotPasswordRequest, ResetPasswordRequest } from "../types/recoverPassword";

const API_BASE_URL = "/api";

export interface UpdateUserRequest {
    name: string;
    lastName: string;
    email: string;
    role: UserRole;
    active: boolean;
}

const request = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>)
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "An error has occurred in the HTTP request");
    }

    return data;
};

export const apiService = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await request<LoginResponseDTO>("/user/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        });

        if (response.data) {
            return {
                ...response,
                data: {
                    token: response.data.token,
                    user: mapUserDtoToUser(response.data.user)
                }
            };
        }

        return response as unknown as ApiResponse<LoginResponse>;
    },

    register: async (payload: RegisterRequest): Promise<ApiResponse<User>> => {
        const response = await request<UserDTO>("/user/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.data) {
            return {
                ...response,
                data: mapUserDtoToUser(response.data)
            };
        }

        return response as unknown as ApiResponse<User>;
    },

    forgotPassword: async (payload: ForgotPasswordRequest): Promise<ApiResponse<void>> => {
        return request<void>("/user/forgot-password", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    resetPassword: async (payload: ResetPasswordRequest): Promise<ApiResponse<void>> => {
        return request<void>("/user/reset-password", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },


    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await request<UserDTO>("/user/profile", {
            method: "GET"
        });

        if (response.data) {
            return {
                ...response,
                data: mapUserDtoToUser(response.data)
            };
        }

        return response as unknown as ApiResponse<User>;
    },

    getUsers: async (): Promise<ApiResponse<User[]>> => {
        const response = await request<UserDTO[]>("/user/users", {
            method: "GET"
        });

        if (response.data) {
            return {
                ...response,
                data: mapUserDtosToUsers(response.data)
            };
        }

        return response as unknown as ApiResponse<User[]>;
    },

    updateUser: async (userId: number, payload: UpdateUserRequest): Promise<ApiResponse<void>> => {
        return request<void>(`/user/${userId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    },

    deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
        return request<void>(`/user/${userId}`, {
            method: "DELETE"
        });
    },

    searchUsers: async (filter: QueryFilter): Promise<ApiResponse<SearchResponse<User>>> => {
        const response = await request<SearchResponse<UserDTO>>("/user/search", {
            method: "POST",
            body: JSON.stringify(filter)
        });

        if (response.data) {
            return {
                ...response,
                data: {
                    total: response.data.total,
                    items: mapUserDtosToUsers(response.data.items)
                }
            };
        }

        return response as unknown as ApiResponse<SearchResponse<User>>;
    }
};