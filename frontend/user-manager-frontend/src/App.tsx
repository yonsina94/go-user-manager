import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RecoverPasswordPage } from "./features/auth/pages/RecoverPasswordPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública de Login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />

        {/* Rutas Protegidas que requieren estar logueado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<DashboardLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};