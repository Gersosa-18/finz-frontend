import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import { useEffect, useState } from "react";
import { useAuthRefresh } from "./hooks/useAuthRefresh";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useAuthRefresh();

  // Verificar auth inicial
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    setIsAuth(!!(token && refreshToken));
    setLoading(false);
  };

  // Función para actualizar estado de auth
  const handleAuthChange = () => {
    checkAuth();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const token = localStorage.getItem("token");
        if (token) {
          // Validar token al volver a la tab
          fetch(`${API_URL}/auth/heartbeat`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {
            console.log("Sesión expirada");
            setIsAuth(false);
          });
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
