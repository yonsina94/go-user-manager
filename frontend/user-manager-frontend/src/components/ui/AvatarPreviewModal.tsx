import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, User as UserIcon } from "lucide-react";

/* Hallmark · component: lightbox-modal · genre: modern-minimal · design-system: design.md */

interface AvatarPreviewModalProps {
    imageSrc: string;
    name: string;
    email?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const AvatarPreviewModal = ({
    imageSrc,
    name,
    email,
    isOpen,
    onClose,
}: AvatarPreviewModalProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = imageSrc;
        link.download = `avatar_${name.toLowerCase().replace(/\s+/g, "_")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return createPortal(
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden animate-modal-card"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                    <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-ink)] shrink-0">
                            <UserIcon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-display text-base font-bold text-[var(--color-ink)] truncate tracking-tight">
                                {name}
                            </h2>
                            {email && (
                                <p className="text-xs text-[var(--color-ink-2)] truncate font-mono">
                                    {email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDownload}
                            title="Descargar imagen"
                            className="p-2 rounded-xl text-[var(--color-ink-2)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4 stroke-[1.75]" />
                        </button>
                        <button
                            onClick={onClose}
                            title="Cerrar (Esc)"
                            className="p-2 rounded-xl text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4 stroke-[1.75]" />
                        </button>
                    </div>
                </div>

                {/* Main Extended Avatar View */}
                <div className="flex justify-center items-center py-2 bg-[var(--color-paper-3)] rounded-2xl p-4 border border-[var(--color-rule)]">
                    <img
                        src={imageSrc}
                        alt={`Foto de perfil extendida de ${name}`}
                        className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-lg border-2 border-[var(--color-paper-2)] select-none transition-transform duration-200 hover:scale-[1.01]"
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};
