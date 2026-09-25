import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import { useEffect, useState, useCallback } from "react";
import { useAuthRefresh } from "./hooks/useAuthRefresh";
import { API_URL } from "./services/api";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useAuthRefresh();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    setIsAuth(!!(token && refreshToken));
    setLoading(false);
  }, []);

  // Verificar auth inicial
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Función para actualizar estado de auth
  const handleAuthChange = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const res = await fetch(`${API_URL}/auth/heartbeat`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
              localStorage.clear();
              setIsAuth(false);
            }
          } catch {
            // Error de red temporal, no desloguear inmediatamente al usuario
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (loading) return <div>Cargando ...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={handleAuthChange} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuth ? (
              <MainLayout onLogout={handleAuthChange} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuth ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
