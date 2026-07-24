import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import type { User } from "../../users/types/user";
import { apiService } from "../../../services/api.service";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (error) {
                console.error("Error al parsear usuario almacenado:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }, []);

    const login = useCallback((newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
    }, []);

    const refreshUser = useCallback(async () => {
        if (token) {
            try {
                const res = await apiService.getProfile();
                if (res.data) {
                    setUser(res.data);
                    localStorage.setItem("user", JSON.stringify(res.data));
                }
            } catch (err) {
                console.error("Error refreshing user profile:", err);
            }
        }
    }, [token]);

    // 1. Validar token al inicio
    useEffect(() => {
        if (token) {
            apiService.getProfile()
                .then((res) => {
                    if (res.data) {
                        setUser(res.data);
                        localStorage.setItem("user", JSON.stringify(res.data));
                    }
                })
                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [token, logout]);

    // 2. Sincronización multi-pestaña (si se cierra sesión en otra pestaña)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "token" && !e.newValue) {
                logout();
            }
        };

        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("unauthorized", handleUnauthorized);
        };
    }, [logout]);

    // 3. Memorizar el valor del contexto para evitar re-renders masivos e innecesarios
    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout,
            refreshUser,
        }),
        [user, token, isLoading, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir el contexto de forma limpia
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};
