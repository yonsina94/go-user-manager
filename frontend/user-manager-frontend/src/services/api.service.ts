import type { LoginRequest, LoginResponse, LoginResponseDTO, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from "../features/auth/types/auth.types";
import type { ApiResponse } from "../types/response";
import type { User, UserDTO, UserRole } from "../features/users/types/user";
import { mapUserDtoToUser, mapUserDtosToUsers } from "../features/users/mappers/user.mapper";
import type { QueryFilter, SearchResponse } from "../types/query";
import type { AuditLog } from "../features/audit/types/audit";

const API_BASE_URL = "/api";

export interface UpdateUserRequest {
    name: string;
    lastName: string;
    email: string;
    role: UserRole;
    active: boolean;
}

export interface UpdateProfilePayload {
    name: string;
    lastName: string;
}

export interface UpdatePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

const request = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers as Record<string, string>)
    };

    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
        window.dispatchEvent(new Event("unauthorized"));
    }

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

    logout: async (): Promise<ApiResponse<void>> => {
        return request<void>("/user/logout", {
            method: "POST"
        });
    },

    updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<User>> => {
        const response = await request<UserDTO>("/user/profile", {
            method: "PUT",
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

    updatePassword: async (payload: UpdatePasswordPayload): Promise<ApiResponse<void>> => {
        return request<void>("/user/password", {
            method: "PUT",
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

    uploadUserAvatar: async (userId: number, file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
        const formData = new FormData();
        formData.append('avatar', file);

        return request<{ avatarUrl: string }>(`/user/${userId}/avatar`, {
            method: 'PUT',
            body: formData,
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
    },

    exportUsersCSV: async (filter: QueryFilter): Promise<Blob> => {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/user/export/csv`, {
            method: "POST",
            headers,
            body: JSON.stringify(filter),
        });

        if (!response.ok) {
            throw new Error("Error al exportar los usuarios a CSV");
        }

        return await response.blob();
    },

    searchAuditLogs: async (filter: QueryFilter): Promise<ApiResponse<SearchResponse<AuditLog>>> => {
        return request<SearchResponse<AuditLog>>("/audit-logs/search", {
            method: "POST",
            body: JSON.stringify(filter)
        });
    }
};