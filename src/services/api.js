import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: async (correo, contrasena) => {
    const res = await api.post("/login", { correo, contrasena });
    localStorage.setItem("token", res.data.access_token);
    return res.data;
  },
  logout: () => localStorage.removeItem("token"),
};

export const alertasAPI = {
  getMisAlertas: () => api.get("/alertas/mis-alertas"),
  crearSimple: (data) => api.post("/alertas/simple", data),
  desactivar: (id) => api.put(`/alertas/${id}/desactivar`),
  eliminar: (id) => api.delete(`/alertas/${id}`),
  getActivadas: () => api.get("/alertas/activadas"),
};

export default api;
