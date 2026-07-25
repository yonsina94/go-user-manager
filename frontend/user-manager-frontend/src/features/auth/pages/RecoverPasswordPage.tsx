import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../../../services/api.service";
import { ShieldCheck, Mail, Lock, ArrowLeft, Send } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Centered Panel Card · design-system: design.md · designed-as-app */

interface RecoverPasswordProps {
    recoveryToken?: string;
}

export const RecoverPasswordPage = ({ recoveryToken }: RecoverPasswordProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeToken = recoveryToken || searchParams.get('token');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (activeToken) {
                if (password !== confirmPassword)
                    throw new Error("Las contraseñas no coinciden");

                await apiService.resetPassword({ token: activeToken, newPassword: password });
                setMessage("¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...");
                setTimeout(() => navigate("/login"), 2500);
            } else {
                await apiService.forgotPassword({ email });
                setMessage("Hemos enviado las instrucciones a tu correo electrónico.");
            }
        } catch (error: any) {
            setError(error || new Error("Ocurrió un error al procesar la solicitud"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4 text-left">
            <div className="w-full max-w-md bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl shadow-sm p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] mx-auto flex items-center justify-center text-[var(--color-accent-ink)] shadow-sm">
                        <ShieldCheck className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                        {activeToken ? "Restablecer Contraseña" : "Recuperar Contraseña"}
                    </h2>
                    <p className="text-sm text-[var(--color-ink-2)]">
                        {activeToken ? "Ingresa tu nueva contraseña a continuación" : "Ingresa tu correo para recibir instrucciones de acceso"}
                    </p>
                </div>

                {message && (
                    <div className="p-3.5 bg-[var(--color-success-bg)] border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm rounded-xl font-medium">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-3.5 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-xl font-medium">
                        {error.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!activeToken ? (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-ink-2)] stroke-[1.75]" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite tu nueva contraseña"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-[var(--color-accent-ink)] font-semibold rounded-xl shadow-sm transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-2"
                    >
                        <Send className="w-4 h-4 stroke-[2]" />
                        <span>{loading ? "Procesando..." : activeToken ? "Restablecer Contraseña" : "Enviar Correo"}</span>
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-[var(--color-rule)]">
                    <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-medium text-[var(--color-accent)] hover:underline">
                        <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Volver al Inicio de Sesión</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

