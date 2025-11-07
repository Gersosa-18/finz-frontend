import { useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const useAuthRefresh = () => {
  useEffect(() => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return;

    const refreshToken = async () => {
      try {
        const res = await axios.post(`${API_URL}/refresh`, {
          refresh_token: refresh,
        });
        localStorage.setItem("token", res.data.access_token);
        console.log("Token renovado");
      } catch (error) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    const interval = setInterval(refreshToken, 25 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
