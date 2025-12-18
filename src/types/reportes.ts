export interface ReporteResponse {
  id: number;
  resumen_groq: string;
  fecha_inicio: string;
  fecha_fin: string;
  indices_json: Array<{
    ticker: string;
    cambio_porcentual: number;
    precio_actual: number;
    precio_apertura: number;
  }>;
  sectores_json: Array<{
    ticker: string;
    cambio_porcentual: number;
    precio_actual: number;
    precio_apertura: number;
  }>;
  created_at: string;
}
