import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../auth/context/AuthContext";
import { apiService } from "../../../services/api.service";
import { UserAvatar } from "../../../components/ui/UserAvatar";

const Card = styled.div.attrs({
  className: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm",
})``;

const AlertBox = styled.div.attrs<{ $type: "success" | "error" }>((props) => ({
  className: `p-3 rounded-lg text-sm mb-4 border transition-colors ${
    props.$type === "success"
      ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
      : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
  }`,
}))``;

const Button = styled.button.attrs({
  className: "w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 cursor-pointer",
})``;

const Input = styled.input.attrs({
  className: "w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500",
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
              size={120}
              editable={true}
              onAvatarUpload={async (file) => {
                const res = await apiService.uploadUserAvatar(user.id, file);
                await refreshUser();
                return res.data?.avatarUrl;
              }}
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name} {user.lastname}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                @{user.username} • {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                {user.role}
              </span>
            </div>
          </Card>
    
          {/* Grid 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario 1: Datos Personales */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                ✏️ Datos Personales
              </h3>
    
              {profileMessage && (
                <AlertBox $type={profileMessage.type}>
                  {profileMessage.text}
                </AlertBox>
              )}
    
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico (Solo lectura)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
    
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
            </Card>
    
            {/* Formulario 2: Cambiar Contraseña */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🔒 Seguridad y Contraseña
              </h3>
    
              {passwordMessage && (
                <AlertBox $type={passwordMessage.type}>
                  {passwordMessage.text}
                </AlertBox>
              )}
    
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  {passwordLoading ? "Actualizando..." : "Cambiar Contraseña"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
    );
};