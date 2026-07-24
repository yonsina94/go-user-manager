import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/login/Login.page";
import { ProtectedRoute } from "./components/protected.route";

import { RecoveryPasswordPage } from "./pages/recoverPassword/recoverPassword.page";
import { DashboardLayout } from "./layouts/dashboard/dashboard.layout";



     // Layout Principal con Sidebar                                                                                                                      

  
    export const App = () => {
      return (
        <BrowserRouter>
          <Routes>
            {/* Ruta Pública de Login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recover-password" element={<RecoveryPasswordPage />} />
  
  
            {/* Rutas Protegidas que requieren estar logueado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<DashboardLayout />} />
            </Route>
          </Routes>
        </BrowserRouter>
      );
    };