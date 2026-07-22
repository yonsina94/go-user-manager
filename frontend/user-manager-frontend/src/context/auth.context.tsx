import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/user";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

    const AuthContext = createContext<AuthContextType |      
  undefined>(undefined);      

  export const AuthProvider = ({ children }: { children:   
  ReactNode }) => {                                          
      const [user, setUser] = useState<User | null>(null);   
      const [token, setToken] = useState<string | null>(null);
                                                             
      // Al cargar la app, recuperar el token y usuario de localStorage si existen                                    
      useEffect(() => {                                      
        const savedToken = localStorage.getItem("token");    
        const savedUser = localStorage.getItem("user");      
                                                             
        if (savedToken && savedUser) {                       
          try {                                              
            setToken(savedToken);                            
            setUser(JSON.parse(savedUser));                  
          } catch (error) {                                  
            console.error("Error al parsear el usuario almacenado:", error);                                      
            localStorage.removeItem("token");                
            localStorage.removeItem("user");                 
          }                                                  
        }                                                    
      }, []);                                                
                                                             
      const login = (newToken: string, newUser: User) => {   
        setToken(newToken);                                  
        setUser(newUser);                                    
        localStorage.setItem("token", newToken);             
        localStorage.setItem("user", JSON.stringify(newUser));
      };
        
      const logout = () => {
        setToken(null);     
        setUser(null); 
        localStorage.removeItem("token");
        localStorage.removeItem("user"); 
      };
        
      return (
        <AuthContext.Provider
          value={{           
            user, 
            token,
            isAuthenticated: !!token,
            login,
            logout, 
          }}       
        >   
          {children}
        </AuthContext.Provider>
      );
    };  
       
    // Hook personalizado para consumir el contexto de forma limpia                                                     
    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
      }             
      return context;
    };