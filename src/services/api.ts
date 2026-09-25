import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  AlertasActivadasResponse,
  AlertasResponse,
  CrearAlertaPorcentajePayload,
  CrearAlertaRangoPayload,
  CrearAlertaSimplePayload,
  TickersSeguimientoResponse,
} from "../types/alertas";
import { EventosResponse } from "../types/eventos";
import { MisRSIResponse } from "../types/rsi";
import { ReporteResponse } from "../types/reportes";
import { AnalisisResponse } from "../types/analisis";
import { LoginResponse, RefreshResponse } from "../types/auth";

export const API_URL = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueuedPromise {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue: QueuedPromise[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response con sincronización de token refresh y cola de promesas
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/login");
    // Detectar 401 Unauthorized o 403 con mensaje de token
    const isUnauthorized = error.response?.status === 401;
    const isLegacyTokenForbidden =
      error.response?.status === 403 &&
      typeof (error.response?.data as { error?: string })?.error === "string" &&
      (error.response?.data as { error: string }).error.toLowerCase().includes("token");
    if ((isUnauthorized || isLegacyTokenForbidden) && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        authAPI.logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
      try {
        const res = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        const newToken = res.data.access_token;
        localStorage.setItem("token", newToken);
        if (res.data.refresh_token) {
          localStorage.setItem("refreshToken", res.data.refresh_token);
        }
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        authAPI.logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Helper para extraer mensajes de error tipados sin usar 'any'
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Ocurrió un error inesperado"
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string; message?: string; error?: string }
      | undefined;
    return (
      data?.error ||
      data?.detail ||
      data?.message ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

// Auth Api
export const authAPI = {
  login: async (correo: string, contrasena: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/login", { correo, contrasena });
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
  getMisAlertas: () => api.get<AlertasResponse>("/alertas/mis-alertas"),
  crearSimple: (data: CrearAlertaSimplePayload) => api.post("/alertas/simple", data),
  crearRango: (data: CrearAlertaRangoPayload) => api.post("/alertas/rango", data),
  crearPorcentaje: (data: CrearAlertaPorcentajePayload) =>
    api.post("/alertas/porcentaje", data),
  desactivar: (id: number) => api.put(`/alertas/${id}/desactivar`),
  eliminar: (id: number) => api.delete(`/alertas/${id}`),
  getActivadas: () => api.get<AlertasActivadasResponse>("/alertas/activadas"),
  getTickersSeguimiento: () =>
    api.get<TickersSeguimientoResponse>("/alertas/tickers-seguimiento"),
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

// Reportes API
export const reporteAPI = {
  getSemanalActual: () =>
    api.get<ReporteResponse[]>("/reportes/semanal-actual"),
};

// Analisis API
export const analisisAPI = {
  analizar: (
    ticker: string,
    timeframe: string,
    imagen: File,
    observacion: string
  ) => {
    const form = new FormData();
    form.append("ticker", ticker);
    form.append("timeframe", timeframe);
    form.append("imagen", imagen);
    form.append("observacion", observacion);
    return api.post<AnalisisResponse>("/analisis/chart", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
