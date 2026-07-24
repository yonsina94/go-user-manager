import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api.service";

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/users", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await apiService.login({ username, password });

            if (response.data) {
                login(response.data.token, response.data.user);
                navigate("/users");
            }
        } catch (error: any) {
            setError(error || new Error("Ocurrió un error al intentar iniciar sesión"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <span className="text-4xl">⚡</span>
                    <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-50 mt-2">User Manager</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales a continuación</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg">{error.message}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Nombre de Usuario"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
                    >
                        {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a onClick={(e) => { e.preventDefault(); navigate("/recover-password"); }} className="text-sm text-purple-600 hover:underline cursor-pointer">
                        ¿Olvidaste tu Contraseña?
                    </a>
                </div>
            </div>
        </div>
    );
};
