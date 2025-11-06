import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import { useEffect, useState } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

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
