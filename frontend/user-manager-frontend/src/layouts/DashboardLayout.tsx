import { useNavigate, Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { UserAvatar } from "../components/ui/UserAvatar";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { Zap, User as UserIcon, Users, Settings, LogOut } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { path: "/profile", label: "Mi Perfil", icon: UserIcon },
        { path: "/users", label: "Usuarios", icon: Users },
        { path: "/settings", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-ink)]">
            {/* Workbench Sidebar Navigation */}
            <aside className="w-64 bg-[var(--color-paper-2)] border-r border-[var(--color-rule)] flex flex-col justify-between p-5 transition-colors duration-200">
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

                {/* User Session Footprint */}
                <div className="pt-4 border-t border-[var(--color-rule)] flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                        <UserAvatar
                            avatarUrl={user?.avatarUrl}
                            email={user?.email || ""}
                            name={user?.name || "Usuario"}
                            size={36}
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
            </aside>

            {/* Main Workbench Stage */}
            <main className="flex-1 p-8 overflow-y-auto">
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

