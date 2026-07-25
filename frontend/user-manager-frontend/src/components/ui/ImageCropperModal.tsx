import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Crop, X, ZoomIn } from "lucide-react";

/* Hallmark · component: modal · genre: modern-minimal · design-system: design.md */

interface ImageCropperModalProps {
    imageSrc: string;
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (croppedImage: File) => void;
}

export const ImageCropperModal = ({ imageSrc, isOpen, onClose, onCropComplete }: ImageCropperModalProps) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (imageSrc && isOpen) {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                imageRef.current = img;
                setPosition({ x: 0, y: 0 });
                setZoom(1);
                requestAnimationFrame(() => {
                    drawCanvas(img, 0, 0, 1);
                });
            };
        }
    }, [imageSrc, isOpen]);

    const drawCanvas = (img: HTMLImageElement, offsetX: number, offsetY: number, currentZoom: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 300;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.save();

        // Máscara circular
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(0, 0, size, size);

        const aspectRatio = img.width / img.height;
        let drawWidth = size * currentZoom;
        let drawHeight = size * currentZoom;

        if (aspectRatio > 1) {
            drawWidth = size * aspectRatio * currentZoom;
        } else {
            drawHeight = (size / aspectRatio) * currentZoom;
        }

        const drawX = (size - drawWidth) / 2 + offsetX;
        const drawY = (size - drawHeight) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();
    };

    useEffect(() => {
        if (imageRef.current) {
            drawCanvas(imageRef.current, position.x, position.y, zoom);
        }
    }, [position, zoom]);

    // Arrastre (Pan)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Exportar Blob recortando en HD
    const handleCropSave = () => {
        const img = imageRef.current;
        if (!img) return;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 512;
        exportCanvas.height = 512;

        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(256, 256, 256, 0, Math.PI * 2);
        ctx.clip();

        const size = 512;
        const aspectRatio = img.width / img.height;
        let drawWidth = size * zoom;
        let drawHeight = size * zoom;

        if (aspectRatio > 1) {
            drawWidth = size * aspectRatio * zoom;
        } else {
            drawHeight = (size / aspectRatio) * zoom;
        }

        const scaleFactor = 512 / 300;
        const drawX = (size - drawWidth) / 2 + position.x * scaleFactor;
        const drawY = (size - drawHeight) / 2 + position.y * scaleFactor;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        exportCanvas.toBlob((blob) => {
            if (!blob) return;
            const croppedFile = new File([blob], "avatar_cropped.png", { type: "image/png" });
            onCropComplete(croppedFile);
            onClose();
        }, "image/png", 0.95);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-6 shadow-xl max-w-md w-full text-left space-y-5 animate-modal-card">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--color-rule)]">
                    <div className="flex items-center space-x-2.5">
                        <Crop className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                        <h2 className="font-display text-lg font-bold text-[var(--color-ink)] tracking-tight">
                            Ajustar Foto de Perfil
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 stroke-[1.75]" />
                    </button>
                </div>

                {/* Visor Interactivo de Canvas */}
                <div
                    className="relative flex justify-center items-center cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className="rounded-full border-2 border-[var(--color-accent)] shadow-inner bg-[var(--color-paper-3)]"
                    />
                </div>

                {/* Controles de Zoom */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-[var(--color-ink-2)]">
                        <span className="flex items-center space-x-1">
                            <ZoomIn className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>Zoom</span>
                        </span>
                        <span className="font-mono">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-[var(--color-accent)] cursor-pointer"
                    />
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--color-rule)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCropSave}
                        className="px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-ink)] font-semibold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                    >
                        Guardar Foto
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};