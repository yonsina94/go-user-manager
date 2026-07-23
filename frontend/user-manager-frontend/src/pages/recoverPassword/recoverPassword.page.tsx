import React, { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { apiService } from "../../services/api.service"

interface RecoverPasswordProps {
    recoveryToken?: string
}

export const RecoveryPasswordPage = ({ recoveryToken }: RecoverPasswordProps) => {
 const [searchParams] = useSearchParams()  
 const navigate = useNavigate() 

 const activeToken = recoveryToken || searchParams.get('token')

 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [confirmPassword, setConfirmPassword] = useState("")

const [loading, setLoading] = useState(false)
const [message, setMessage] = useState<string | null>(null)
const [error, setError] = useState<Error | null>(null)

const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
        if(activeToken){
            if(password !== confirmPassword)
                throw new Error("Passwords not match");
            
            await apiService.resetPassword({token: activeToken, password})
            setMessage("¡Contraseña restablecida con éxito! Redirigiendo al login...");                                       
            setTimeout(() => navigate("/login"), 3000);   
        } else {
            await apiService.forgotPassword({ email });             
            setMessage("Te hemos enviado las instrucciones a tu correo electrónico.");  
        }
    } catch (error: any) {
          setError(error || "Ocurrió un error al procesar la solicitud"); 
    } finally {
        setLoading(false)
    }
}

return (                                                      
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-left">                
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6">                                                   
                                                                    
            {/* Encabezado */}                                      
            <div className="text-center">                           
              <span className="text-4xl">🔐</span>                  
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-50 mt-2">                                          
                {activeToken ? "Restablecer Contraseña" : "Recuperar Contraseña"}                                                      
              </h2>                                                 
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">                                                            
                { activeToken ? "Ingresa tu nueva contraseña a continuación" : "Ingresa tu correo para recibir las instrucciones"}                                                   
              </p>                                                  
            </div>                                                  
                                                                    
            {/* Alertas de Éxito / Error */}                        
            {message && (                                           
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm rounded-lg">                                                              
                {message}                                           
              </div>                                                
            )}                                                      
            {error && (                                             
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg">        
                {error.message}                                             
              </div>                                                
            )}                                                      
                                                                    
            {/* Formulario */}                                      
            <form onSubmit={handleSubmit} className="space-y-4">    
              {!activeToken ? (                                     
                /* Modo 1: Solicitar Email */                       
                <div>                                               
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">                                
                    Correo Electrónico                              
                  </label>                                          
                  <input                                            
                    type="email"                                    
                    required                                        
                    value={email}                                   
                    onChange={(e) => setEmail(e.target.value)}      
                    placeholder="tu@email.com"                      
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"                                                       
                  />                                                
                </div>                                              
              ) : (                                                 
                /* Modo 2: Nueva Contraseña */                      
                <>                                                  
                  <div>                                             
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">                           
                      Nueva Contraseña                              
                    </label>                                        
                    <input                                          
                      type="password"                               
                      required                                      
                      minLength={6}                                 
                      value={password}                           
                      onChange={(e) => setPassword(e.target.value)}                                                           
                      placeholder="Mínimo 6 caracteres"             
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"                                                       
                    />                                              
                  </div>                                            
                  <div>                                             
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">                           
                      Confirmar Contraseña                          
                    </label>                                        
                    <input                                          
                      type="password"                               
                      required                                      
                      minLength={6}                                 
                      value={confirmPassword}                       
                      onChange={(e) => setConfirmPassword(e.target.value)}                                                           
                      placeholder="Repite tu nueva contraseña"      
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"                                                       
                    />                                              
                  </div>                                            
                </>                                                 
              )}                                                    
                                                                    
              <button                                               
                type="submit"                                       
                disabled={loading}                                  
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
              >
                {loading ? "Procesando..." : activeToken ? "Restablecer Contraseña" : "Enviar Correo"}
              </button>
            </form>
  
            {/* Enlace para regresar al Login */}
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm text-purple-600 hover:underline">
                ← Volver al Inicio de Sesión
              </Link>
            </div>
  
          </div>
        </div>
      );

}