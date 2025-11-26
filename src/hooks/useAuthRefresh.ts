import { useEffect } from "react";
import axios from "axios";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const useAuthRefresh = () => {
  useEffect(() => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return;

    // Renovar token cada 25 min
    const refreshToken = async () => {
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        localStorage.setItem("token", res.data.access_token);
        console.log("Token renovado");
      } catch (error) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    // Heartbeat
    const heartbeat = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.get(`${API_URL}/auth/heartbeat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.log("Sesión inválida");
      }
    };

    const refreshInterval = setInterval(refreshToken, 25 * 60 * 1000);
    const heartbeatInterval = setInterval(heartbeat, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(heartbeatInterval);
    };
  }, []);
};
