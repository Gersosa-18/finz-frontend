import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../services/api";
import { RefreshResponse } from "../types/auth";

export const useAuthRefresh = () => {
  useEffect(() => {
    // Renovar token periódicamente antes de expiración
    const refreshToken = async () => {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) return;

      try {
        const res = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        localStorage.setItem("token", res.data.access_token);
        if (res.data.refresh_token) {
          localStorage.setItem("refreshToken", res.data.refresh_token);
        }
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          localStorage.clear();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    };

    // Heartbeat
    const heartbeat = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await axios.get(`${API_URL}/auth/heartbeat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        // Sesión inválida o error temporal
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
