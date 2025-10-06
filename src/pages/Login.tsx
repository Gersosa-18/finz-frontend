import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.login(correo, contrasena);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al iniciar sesión");
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Finz Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
