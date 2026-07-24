import { useNavigate, Link, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context";
import { SettingsPage } from "../../pages/settings/settings.page";
import { UsersPage } from "../../pages/users/users.page";
import { UserAvatar } from "../../components/avatar/user/user.avatar";

    export const DashboardLayout = () => {                                                                                                                      
      const { user, logout } = useAuth();                                                                                                                
      const navigate = useNavigate();                                                                                                                    
                                                                                                                                                         
      const handleLogout = () => {                                                                                                                       
        logout();                                                                                                                                        
        navigate("/login");                                                                                                                              
      };                                                                                                                                                 
                                                                                                                                                         
      return (                                                                                                                                           
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">                                                 
          {/* Sidebar */}                                                                                                                                
          <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">                                 
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">                                                                          
              <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-gray-50 m-0 flex items-center space-x-2">                          
                <span className="text-purple-600">⚡</span>                                                                                              
                <span>GoUserManager</span>                                                                                                               
              </h1>                                                                                                                                      
            </div>                                                                                                                                       
                                                                                                                                                         
            <nav className="flex-1 p-4 space-y-1">                                                                                                       
              <Link                                                                                                                                      
                to="/users"                                                                                                                              
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"                                                                                                              
              >                                                                                                                                          
                <span>👥</span>                                                                                                                          
                <span>Usuarios</span>                                                                                                                    
              </Link>                                                                                                                                    
              <Link                                                                                                                                      
                to="/settings"                                                                                                                           
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100     
  dark:hover:bg-gray-800 transition-colors"                                                                                                              
              >                                                                                                                                          
                <span>⚙️</span>                                                                                                                          
                <span>Configuración</span>                                                                                                               
              </Link>                                                                                                                                    
            </nav>                                                                                                                                       
                                                                                                                                                         
            {/* Info de Usuario Logueado & Logout */}                                                                                                    
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto flex items-center justify-between">                                
              <div className="flex items-center space-x-3">                                                                                              
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  email={user?.email || ""}
                  name={user?.name || "Usuario"}
                  size={36}
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name} {user?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
  
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                🚪
              </button>
            </div>
          </aside>
  
          {/* Área Principal */}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
          </main>
        </div>
      );
    };