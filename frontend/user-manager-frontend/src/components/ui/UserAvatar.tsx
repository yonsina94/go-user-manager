import { useEffect, useState } from "react";
import { getGravatarUrl } from "../../utils/gravatar";
import { ImageCropperModal } from "./ImageCropperModal";
import { AvatarPreviewModal } from "./AvatarPreviewModal";
import { Camera, Loader2 } from "lucide-react";
import "./UserAvatar.css";

/* Hallmark · component: avatar · genre: modern-minimal · design-system: design.md */

interface UserAvatarProps {
    avatarUrl?: string | null;
    email: string;
    name: string;
    size?: number;
    editable?: boolean;
    previewable?: boolean;
    onAvatarUpload?: (file: File) => Promise<string | void>;
}

export const UserAvatar = ({
    avatarUrl,
    email,
    name,
    size = 96,
    editable = false,
    previewable = true,
    onAvatarUpload,
}: UserAvatarProps) => {
    const [imgSrc, setImgSrc] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Modales
    const [cropperOpen, setCropperOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState("");

    useEffect(() => {
        let isMounted = true;
        if (avatarUrl && avatarUrl.trim() !== "") {
            setImgSrc(avatarUrl);
        } else {
            getGravatarUrl(email, size * 2).then((url) => {
                if (isMounted) {
                    setImgSrc(url);
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [avatarUrl, email, size]);

    const handleError = async () => {
        if (email) {
            const gravatar = await getGravatarUrl(email, size * 2);
            setImgSrc(gravatar);
        }
    };

    // Abre el modal de recorte
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setTempImageSrc(objectUrl);
        setCropperOpen(true);
        e.target.value = "";
    };

    // Recibe la foto recortada y la envía a MinIO
    const handleCropComplete = async (croppedFile: File) => {
        if (!onAvatarUpload) return;

        try {
            setIsUploading(true);
            const localPreview = URL.createObjectURL(croppedFile);
            setImgSrc(localPreview);

            const newUrl = await onAvatarUpload(croppedFile);
            if (newUrl) {
                setImgSrc(newUrl);
            }
        } catch (err) {
            console.error("Error al subir avatar recortado:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageClick = () => {
        if (previewable && imgSrc) {
            setPreviewOpen(true);
        }
    };

    const badgeSize = Math.max(26, Math.round(size * 0.3));

    return (
        <>
            <div
                className="avatar-container"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    minWidth: `${size}px`,
                    minHeight: `${size}px`,
                }}
            >
                <img
                    src={imgSrc}
                    alt={`Avatar de ${name}`}
                    className={`avatar-image ${previewable ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
                    onClick={handleImageClick}
                    title={previewable ? "Haz clic para ver la foto extendida" : `Avatar de ${name}`}
                    onError={handleError}
                />

                {isUploading && (
                    <div className="avatar-loading-overlay">
                        <Loader2 className="w-5 h-5 text-white animate-spin stroke-[2.2]" />
                    </div>
                )}

                {editable && (
                    <label
                        className="avatar-upload-badge"
                        title="Cambiar foto de perfil"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: `${badgeSize}px`,
                            height: `${badgeSize}px`,
                        }}
                    >
                        <Camera className="w-3.5 h-3.5 text-white stroke-[2]" />
                        <input
                            type="file"
                            accept="image/*"
                            className="avatar-upload-input"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                    </label>
                )}
            </div>

            {/* Modal de Recorte Interactivo */}
            <ImageCropperModal
                imageSrc={tempImageSrc}
                isOpen={cropperOpen}
                onClose={() => setCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />

            {/* Modal de Previsualización Extendida */}
            <AvatarPreviewModal
                imageSrc={imgSrc}
                name={name}
                email={email}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    );
};