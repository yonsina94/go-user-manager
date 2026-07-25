import { useState } from "react";
import { useNavigate, Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { UserAvatar } from "../components/ui/UserAvatar";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { Zap, User as UserIcon, Users, Settings, LogOut, Sun, Moon, Clock, Monitor, Menu, X } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { mode, effectiveTheme, setMode } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const toggleThemeMode = () => {
        if (mode === "auto-schedule") setMode("light");
        else if (mode === "light") setMode("dark");
        else if (mode === "dark") setMode("system");
        else setMode("auto-schedule");
    };

    const getThemeIcon = () => {
        if (mode === "auto-schedule") return <Clock className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />;
        if (mode === "system") return <Monitor className="w-4 h-4 stroke-[1.75]" />;
        if (effectiveTheme === "dark") return <Moon className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />;
        return <Sun className="w-4 h-4 text-amber-500 stroke-[2]" />;
    };

    const getThemeLabel = () => {
        if (mode === "auto-schedule") return "Auto (Hora)";
        if (mode === "system") return "Sistema";
        if (mode === "dark") return "Oscuro";
        return "Claro";
    };

    const navItems = [
        { path: "/profile", label: "Mi Perfil", icon: UserIcon },
        { path: "/users", label: "Usuarios", icon: Users },
        { path: "/settings", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-ink)] transition-colors duration-200">
            {/* Mobile Header Bar */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] sticky top-0 z-40">
                <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-ink)] shadow-sm">
                        <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="font-display font-bold text-base tracking-tight text-[var(--color-ink)]">
                        GoUserManager
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleThemeMode}
                        title={`Modo: ${getThemeLabel()}`}
                        className="p-2 rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                    >
                        {getThemeIcon()}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75]" /> : <Menu className="w-5 h-5 stroke-[1.75]" />}
                    </button>
                </div>
            </header>

            {/* Desktop Workbench Sidebar & Mobile Overlay Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-paper-2)] border-r border-[var(--color-rule)] flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
                mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
            }`}>
                <div className="space-y-6">
                    {/* Brand Logotype */}
                    <div className="flex items-center space-x-3 px-2 py-1">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-ink)] shadow-sm">
                            <Zap className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight text-[var(--color-ink)]">
                            GoUserManager
                        </span>
                    </div>

                    {/* Navigation Items (N5 Pill archetype) */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-sm font-semibold"
                                            : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                                    }`}
                                >
                                    <Icon className="w-4 h-4 stroke-[1.75]" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-3">
                    {/* Dark Mode Quick Switcher */}
                    <button
                        onClick={toggleThemeMode}
                        title={`Modo actual: ${getThemeLabel()}. Haz clic para cambiar.`}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                    >
                        <div className="flex items-center space-x-2">
                            {getThemeIcon()}
                            <span>Tema: {getThemeLabel()}</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase text-[var(--color-ink-2)] bg-[var(--color-paper-3)] px-1.5 py-0.5 rounded">
                            {effectiveTheme}
                        </span>
                    </button>

                    {/* User Session Footprint */}
                    <div className="pt-3 border-t border-[var(--color-rule)] flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                            <UserAvatar
                                avatarUrl={user?.avatarUrl}
                                email={user?.email || ""}
                                name={user?.name || "Usuario"}
                                size={44}
                                previewable={false}
                            />
                            <div className="text-left min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                                    {user?.name} {user?.lastname}
                                </p>
                                <p className="text-xs text-[var(--color-ink-2)] truncate font-mono uppercase tracking-wider">
                                    {user?.role}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Cerrar sesión"
                            className="p-2 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 stroke-[1.75]" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
                />
            )}

            {/* Main Workbench Stage */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/users" replace />} />
                </Routes>
            </main>
        </div>
    );
};



