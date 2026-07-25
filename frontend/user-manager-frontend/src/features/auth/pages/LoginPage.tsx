import { useState, useEffect, useTransition } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api.service";
import { Zap, Lock, User as UserIcon, KeyRound } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Centered Panel Card · design-system: design.md · designed-as-app */

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<Error | null>(null);
    const [isPending, startTransition] = useTransition();

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/users", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = () => {
        setError(null);
        startTransition(async () => {
            try {
                const response = await apiService.login({ username, password });

                if (response.data) {
                    login(response.data.token, response.data.user);
                    navigate("/users");
                }
            } catch (err: any) {
                setError(err || new Error("Ocurrió un error al intentar iniciar sesión"));
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4 text-left">
            <div className="w-full max-w-md bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl shadow-lg p-8 space-y-6 animate-page-entry">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] mx-auto flex items-center justify-center text-[var(--color-accent-ink)] shadow-sm">
                        <Zap className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                        User Manager
                    </h2>
                    <p className="text-sm text-[var(--color-ink-2)]">
                        Ingresa tus credenciales a continuación
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-xl font-medium">
                        {error.message}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                            Usuario
                        </label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
                                placeholder="Nombre de Usuario"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-[var(--color-accent-ink)] font-semibold rounded-xl shadow-sm transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-2"
                    >
                        <KeyRound className="w-4 h-4 stroke-[2]" />
                        <span>{isPending ? "Iniciando Sesión..." : "Iniciar Sesión"}</span>
                    </button>
                </form>


                <div className="text-center pt-2 border-t border-[var(--color-rule)]">
                    <button
                        type="button"
                        onClick={() => navigate("/recover-password")}
                        className="text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer"
                    >
                        ¿Olvidaste tu Contraseña?
                    </button>
                </div>
            </div>
        </div>
    );
};

