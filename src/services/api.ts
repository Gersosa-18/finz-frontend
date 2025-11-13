import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
});

// Tipos
export interface AlertaSimple {
  id: number;
  ticker: string;
  campo: "precio" | "volumen";
  tipo_condicion: "mayor_que" | "menor_que";
  valor: number;
  activo: boolean;
  user_id: number;
  created_at: string;
}

export interface AlertasResponse {
  simple: AlertaSimple[];
  rango: any[];
  porcentaje: any[];
  compuesta: any[];
}

export interface AlertasActivadasResponse {
  alertas_evaluadas: number;
  alertas_activadas: Array<{ id: string; mensaje: string }>;
  total_activadas: number;
}

export interface EventosResponse {
  macro: Array<{ descripcion: string; fecha: string }>;
  micro: Array<{ ticker: string; descripcion: string; fecha: string }>;
  tus_tickers: string[];
}

export interface SenalRSI {
  ticker: string;
  rsi: number;
  estado: "sobreventa" | "sobrecompra" | "neutral";
}

export interface RSIResponse {
  senales: SenalRSI[];
}

export interface RSIData {
  ticker: string;
  rsi_value: number | null;
  timestamp: string | null;
  signal: string | null;
  proxima_actualizacion: string;
  tiene_datos: boolean;
}

export interface MisRSIResponse {
  total: number;
  tickers: RSIData[];
}

// Interceptor Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response - solo logout en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(
      "❌ Axios Error:",
      error.response?.status,
      error.response?.data
    );
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refreshToken");

      if (!refresh) {
        authAPI.logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${api.defaults.baseURL}/refresh`, {
          refresh_token: refresh,
        });

        const newToken = res.data.access_token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Solo logout si el refresh token expiró
        if (refreshError.response?.status === 401) {
          authAPI.logout();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Api
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
  getMisAlertas: () => api.get<AlertasResponse>("/alertas/mis-alertas"),
  crearSimple: (data: any) => api.post("/alertas/simple", data),
  desactivar: (id: number) => api.put(`/alertas/${id}/desactivar`),
  eliminar: (id: number) => api.delete(`/alertas/${id}`),
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
