import styled from "styled-components";
import { useTheme, type ThemeMode } from "../../../context/ThemeContext";
import { Moon, Sun, Monitor, Clock, Check } from "lucide-react";

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md */

const Card = styled.div.attrs({
  className: "bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-6 shadow-sm",
})``;

export const SettingsPage = () => {
  const { mode, effectiveTheme, setMode } = useTheme();

  const themeOptions: { id: ThemeMode; title: string; desc: string; icon: any }[] = [
    {
      id: "auto-schedule",
      title: "Automático (Hora del día)",
      desc: "Activa el modo oscuro automáticamente entre las 19:00 y las 07:00.",
      icon: Clock,
    },
    {
      id: "system",
      title: "Preferencia del Sistema",
      desc: "Sincroniza el tema automáticamente con el sistema operativo de tu equipo.",
      icon: Monitor,
    },
    {
      id: "light",
      title: "Modo Claro",
      desc: "Fuerza la interfaz con fondo claro constante.",
      icon: Sun,
    },
    {
      id: "dark",
      title: "Modo Oscuro",
      desc: "Fuerza la interfaz con fondo oscuro constante.",
      icon: Moon,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-[var(--color-ink-2)] mt-0.5">
          Personaliza la apariencia y el comportamiento de la plataforma.
        </p>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-1">
          Tema y Apariencia
        </h2>
        <p className="text-xs text-[var(--color-ink-2)] mb-5">
          El tema activo actualmente es <span className="font-mono font-bold uppercase text-[var(--color-accent)]">{effectiveTheme}</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start space-x-3.5 relative ${
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-paper-3)] shadow-sm"
                    : "border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-ink-2)]"
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]" : "bg-[var(--color-paper-3)] text-[var(--color-ink-2)]"}`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {opt.title}
                    </p>
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-accent)] stroke-[2.5]" />}
                  </div>
                  <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

