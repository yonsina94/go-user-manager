import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../auth/context/AuthContext";
import { apiService } from "../../../services/api.service";
import { UserAvatar } from "../../../components/ui/UserAvatar";
import { UserCheck, ShieldCheck, Save, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

const Card = styled.div.attrs({
  className: "bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-6 shadow-sm",
})``;

const AlertBox = styled.div.attrs<{ $type: "success" | "error" }>((props) => ({
  className: `p-3.5 rounded-xl text-sm mb-4 border transition-colors flex items-center space-x-2 font-medium ${
    props.$type === "success"
      ? "bg-[var(--color-success-bg)] border-[var(--color-success)]/30 text-[var(--color-success)]"
      : "bg-[var(--color-danger-bg)] border-[var(--color-danger)]/30 text-[var(--color-danger)]"
  }`,
}))``;

const Button = styled.button.attrs({
  className: "w-full px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-[var(--color-accent-ink)] font-semibold text-sm rounded-xl shadow-sm transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-2",
})``;

const Input = styled.input.attrs({
  className: "w-full px-3.5 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] text-[var(--color-ink)] focus:outline-none transition-colors",
})``;

export const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    
    // Personal Data State
    const [name, setName] = useState(user?.name || "");
    const [lastname, setLastName] = useState(user?.lastname || "");
    const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Change password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    if (!user) return null;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);

        try {
            setProfileLoading(true);
            await apiService.updateProfile({ name, lastName: lastname });
            await refreshUser();
            setProfileMessage({ type: "success", text: "¡Perfil actualizado exitosamente!" });
        } catch (error: any) {
            setProfileMessage({ type: "error", text: error.message || "Error al actualizar el perfil" });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" });
            return;
        }

        try {
            setPasswordLoading(true);
            await apiService.updatePassword({ currentPassword, newPassword });
            setPasswordMessage({ type: "success", text: "¡Contraseña actualizada exitosamente!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setPasswordMessage({ type: "error", text: error.message || "Error al actualizar la contraseña" });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          {/* Header Card */}
          <Card className="flex flex-col md:flex-row items-center gap-6">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              email={user.email}
              name={user.name}
              size={110}
              editable={true}
              onAvatarUpload={async (file) => {
                const res = await apiService.uploadUserAvatar(user.id, file);
                await refreshUser();
                return res.data?.avatarUrl;
              }}
            />
            <div className="text-center md:text-left">
              <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                {user.name} {user.lastname}
              </h1>
              <p className="text-sm text-[var(--color-ink-2)] mt-1 font-mono">
                @{user.username} • {user.email}
              </p>
              <span className="inline-block mt-3 px-3 py-1 bg-[var(--color-paper-3)] text-[var(--color-ink)] rounded-full text-xs font-mono uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </Card>
    
          {/* Grid 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario 1: Datos Personales */}
            <Card>
              <h2 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-4 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                <span>Datos Personales</span>
              </h2>
    
              {profileMessage && (
                <AlertBox $type={profileMessage.type}>
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 stroke-[2]" />
                  )}
                  <span>{profileMessage.text}</span>
                </AlertBox>
              )}
    
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
    
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Apellido
                  </label>
                  <Input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
    
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Correo Electrónico (Lectura)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper-3)] text-[var(--color-ink-2)] cursor-not-allowed font-mono"
                    disabled
                  />
                </div>
    
                <Button type="submit" disabled={profileLoading}>
                  <Save className="w-4 h-4 stroke-[2]" />
                  <span>{profileLoading ? "Guardando..." : "Guardar Cambios"}</span>
                </Button>
              </form>
            </Card>
    
            {/* Formulario 2: Cambiar Contraseña */}
            <Card>
              <h2 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-4 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                <span>Seguridad y Contraseña</span>
              </h2>
    
              {passwordMessage && (
                <AlertBox $type={passwordMessage.type}>
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 stroke-[2]" />
                  )}
                  <span>{passwordMessage.text}</span>
                </AlertBox>
              )}
    
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Contraseña Actual
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
    
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Nueva Contraseña
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
    
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
    
                <Button type="submit" disabled={passwordLoading}>
                  <KeyRound className="w-4 h-4 stroke-[2]" />
                  <span>{passwordLoading ? "Actualizando..." : "Cambiar Contraseña"}</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
    );
};