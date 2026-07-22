import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/user";
import { apiService } from "../services/api.service";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Inicialización síncrona desde localStorage para evitar parpadeos y redirecciones al recargar (F5)
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

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

    // Validar en segundo plano que el token siga siendo válido en el servidor
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
                    // Si el token expiró o es inválido en el backend, cerramos sesión
                    logout();
                });
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para consumir el contexto de forma limpia
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};