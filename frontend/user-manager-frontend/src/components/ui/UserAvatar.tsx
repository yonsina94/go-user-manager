  import { useEffect, useState } from "react";
    import { getGravatarUrl } from "../../utils/gravatar";
    import { ImageCropperModal } from "./ImageCropperModal";
    import "./UserAvatar.css";
    
    interface UserAvatarProps {
        avatarUrl?: string | null;
        email: string;
        name: string;
        size?: number;
        editable?: boolean;
        onAvatarUpload?: (file: File) => Promise<string |
  void>;
    }
    
    export const UserAvatar = ({
        avatarUrl,
        email,
        name,
        size = 96,
        editable = false,
        onAvatarUpload,
    }: UserAvatarProps) => {
        const [imgSrc, setImgSrc] = useState("");
        const [isUploading, setIsUploading] =
  useState(false);
    
        // Modal de Recorte
        const [cropperOpen, setCropperOpen] =
  useState(false);
        const [tempImageSrc, setTempImageSrc] =
  useState("");
    
        useEffect(() => {
            let isMounted = true;
            if (avatarUrl && avatarUrl.trim() !== "") {
                setImgSrc(avatarUrl);
            } else {
                getGravatarUrl(email, size * 2).
  then((url) => {
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
                const gravatar = await
  getGravatarUrl(email, size * 2);
                setImgSrc(gravatar);
            }
        };
    
        // Abre el modal de recorte
        const handleFileSelect = (e: React.
  ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
    
            const objectUrl = URL.createObjectURL(file);
            setTempImageSrc(objectUrl);
            setCropperOpen(true);
            e.target.value = "";
        };
    
        // Recibe la foto recortada y la envía a MinIO
        const handleCropComplete = async (croppedFile:
  File) => {
            if (!onAvatarUpload) return;
    
            try {
                setIsUploading(true);
                const localPreview = URL.
  createObjectURL(croppedFile);
                setImgSrc(localPreview);
    
                const newUrl = await
  onAvatarUpload(croppedFile);
                if (newUrl) {
                    setImgSrc(newUrl);
                }
            } catch (err) {
                console.error("Error al subir avatar recortado:", err);
            } finally {
                setIsUploading(false);
            }
        };
    
        const badgeSize = Math.max(24, Math.round(size *
  0.3));
    
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
                        className="avatar-image"
                        onError={handleError}
                    />
    
                    {isUploading && (
                        <div className="avatar-loading-overlay">
                            <span className="spinner">⏳</span>
                        </div>
                    )}

                    {editable && (
                        <label
                            className="avatar-upload-badge"
                            title="Cambiar foto de perfil"
                            style={{
                                width: `${badgeSize}px`,
                                height: `${badgeSize}px`,
                                fontSize: `${badgeSize * 0.5}px`,
                            }}
                        >
                            📷
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
            </>
        );
    };