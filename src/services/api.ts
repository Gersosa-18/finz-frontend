import axios from "axios";
import { AlertasActivadasResponse } from "../types/alertas";
import { EventosResponse } from "../types/eventos";
import { MisRSIResponse } from "../types/rsi";
import { ReporteResponse } from "../types/reportes";

import supabase from "./supabase";

// Helper para extraer user_id del JWT
const getUserIdFromToken = () => {
  try {
    return (
      JSON.parse(atob(localStorage.getItem("token")?.split(".")[1] || ""))
        .user_id || 0
    );
  } catch {
    return 0;
  }
};

const API_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;
      const refresh = localStorage.getItem("refreshToken");

      if (!refresh) {
        authAPI.logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/auth/refresh", {
          refresh_token: refresh,
        });

        const newToken = res.data.access_token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        if (refreshError.response?.status === 401) {
          authAPI.logout();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Auth Api - usa baseURL automáticamente
export const authAPI = {
  login: async (correo: string, contrasena: string) => {
    const res = await api.post("/login", { correo, contrasena });
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("refreshToken", res.data.refresh_token);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
};

// Alertas API
export const alertasAPI = {
  getMisAlertas: async () => {
    const userId = getUserIdFromToken();

    const [simple, rango, porcentaje] = await Promise.all([
      supabase.from("alertas_simple").select("*").eq("user_id", userId),
      supabase.from("alertas_rango").select("*").eq("user_id", userId),
      supabase.from("alertas_porcentaje").select("*").eq("user_id", userId),
    ]);

    return {
      data: {
        simple: simple.data || [],
        rango: rango.data || [],
        porcentaje: porcentaje.data || [],
      },
    };
  },
  crearSimple: (data: any) => api.post("/alertas/simple", data),
  crearRango: (data: any) => api.post("/alertas/rango", data),
  crearPorcentaje: (data: any) => api.post("/alertas/porcentaje", data),
  desactivar: (id: number) => api.put(`/alertas/${id}/desactivar`),
  eliminar: async (id: number, tipo: string) => {
    const tabla =
      tipo === "simple"
        ? "alertas_simple"
        : tipo === "rango"
          ? "alertas_rango"
          : "alertas_porcentaje";
    const { error } = await supabase.from(tabla).delete().eq("id", id);
    if (error) throw error;
    return { data: { message: "Eliminada" } };
  },
  getActivadas: () => api.get<AlertasActivadasResponse>("/alertas/activadas"),
  getTickersSeguimiento: () => api.get("/alertas/tickers-seguimiento"),
};

// Eventos API
export const eventosAPI = {
  getMisEventos: () => api.get<EventosResponse>("/eventos/mis-eventos"),
};

// Señales API
export const rsiAPI = {
  getMisRSI: () => api.get<MisRSIResponse>("/rsi/mis-rsi"),
  agregar: (ticker: string) => api.post("/rsi/seguimientos", { ticker }),
  eliminar: (ticker: string) => api.delete(`/rsi/seguimientos/${ticker}`),
};
export default api;

// Reportes API
export const reporteAPI = {
  getSemanalActual: () =>
    api.get<ReporteResponse[]>("/reportes/semanal-actual"),
};
