import { useEffect, useState } from "react"
import { getGravatarUrl } from "../../../utils/gravatar"
import "./user.avatar.css"

interface UserAvatarProps {
    avatarUrl?: string | null
    email: string
    name: string
    size?: number
    editable?: boolean
    onAvatarUpload?: (file: File) => Promise<string | void>
}

export const UserAvatar = ({
    avatarUrl,
    email,
    name,
    size = 96,
    editable = false,
    onAvatarUpload,
  }: UserAvatarProps) => {
    const [imgSrc, setImgSrc] = useState("")
    const [isUploading, setIsUploading] = useState(false)
  
    useEffect(()=>{
        let isMounted = true
        if (avatarUrl){
            setImgSrc(avatarUrl)
        }else{
            getGravatarUrl(email).then((url)=>{
                if(isMounted){
                    setImgSrc(url)
                }
            })
        }
        return () => {
            isMounted = false
        }
     },[avatarUrl, email, size])

     const handleError = async () => {
        const gravatar = await getGravatarUrl(email, size * 2);
        setImgSrc(gravatar);
     };
  
     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !onAvatarUpload) return
        
        try {
            setIsUploading(true)
            const localPreview = URL.createObjectURL(file)
            setImgSrc(localPreview)
            const newUrl = await onAvatarUpload(file)
            if (newUrl) {
                setImgSrc(newUrl)
            }
        } catch(err){
            console.error(err)
        } finally{
            setIsUploading(false)
        }
     }

              return (
        <div
          className="avatar-container"
          style={{ '--avatar-size':`${size}px` } as React.CSSProperties}
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
            <label className="avatar-upload-badge" title="Cambiar foto de perfil">
              📷
              <input
                type="file"
                accept="image/*"
                className="avatar-upload-input"

  onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      );
  }