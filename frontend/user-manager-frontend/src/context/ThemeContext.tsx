import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* Hallmark · context: theme · mode: system | auto-schedule | light | dark */

export type ThemeMode = "auto-schedule" | "system" | "light" | "dark";

interface ThemeContextType {
    mode: ThemeMode;
    effectiveTheme: "light" | "dark";
    setMode: (mode: ThemeMode) => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem("theme_mode") as ThemeMode;
        return saved || "auto-schedule";
    });

    const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem("theme_mode", newMode);
    };

    useEffect(() => {
        const updateTheme = () => {
            let isDark = false;

            if (mode === "dark") {
                isDark = true;
            } else if (mode === "light") {
                isDark = false;
            } else if (mode === "system") {
                isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            } else if (mode === "auto-schedule") {
                const hour = new Date().getHours();
                isDark = hour >= 19 || hour < 7;
            }

            setEffectiveTheme(isDark ? "dark" : "light");

            const root = document.documentElement;
            if (isDark) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        updateTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleMediaChange = () => {
            if (mode === "system") updateTheme();
        };
        mediaQuery.addEventListener("change", handleMediaChange);

        const interval = setInterval(() => {
            if (mode === "auto-schedule") updateTheme();
        }, 60000);

        return () => {
            mediaQuery.removeEventListener("change", handleMediaChange);
            clearInterval(interval);
        };
    }, [mode]);

    return (
        <ThemeContext value={{ mode, effectiveTheme, setMode }}>
            {children}
        </ThemeContext>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme debe usarse dentro de un ThemeProvider");
    return context;
};

