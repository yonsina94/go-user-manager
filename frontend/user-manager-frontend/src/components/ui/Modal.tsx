import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { X } from "lucide-react";

/* Hallmark & vercel-composition-patterns · component: compound-modal · genre: modern-minimal */

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

interface ModalHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    onClose: () => void;
}

interface ModalBodyProps {
    children: ReactNode;
    className?: string;
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

const SizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

const ModalCard = styled.div.attrs<{ $size: keyof typeof SizeMap }>((props) => ({
    className: `bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl w-full ${
        SizeMap[props.$size] || SizeMap.lg
    } p-6 shadow-xl space-y-6 text-left animate-modal-card max-h-[90vh] overflow-y-auto`,
}))``;

export const ModalRoot = ({ isOpen, onClose, children, size = "lg" }: ModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <ModalCard $size={size}>{children}</ModalCard>
        </div>,
        document.body
    );
};

const ModalHeader = ({ title, subtitle, icon, onClose }: ModalHeaderProps) => (
    <div className="flex justify-between items-start border-b border-[var(--color-rule)] pb-4">
        <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
                {icon && <span className="shrink-0">{icon}</span>}
                <h2 className="font-display text-xl font-bold text-[var(--color-ink)] tracking-tight">
                    {title}
                </h2>
            </div>
            {subtitle && (
                <div className="text-xs font-mono text-[var(--color-ink-2)]">{subtitle}</div>
            )}
        </div>
        <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
        >
            <X className="w-5 h-5 stroke-[1.75]" />
        </button>
    </div>
);

const ModalBody = ({ children, className = "space-y-4" }: ModalBodyProps) => (
    <div className={className}>{children}</div>
);

const ModalFooter = ({ children, className = "flex justify-end space-x-3 pt-4 border-t border-[var(--color-rule)]" }: ModalFooterProps) => (
    <div className={className}>{children}</div>
);

// Compound Component Pattern exports
export const Modal = Object.assign(ModalRoot, {
    Header: ModalHeader,
    Body: ModalBody,
    Footer: ModalFooter,
});
