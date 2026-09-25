// Archivo para interfaces
export interface AlertaSimple {
  id: number;
  ticker: string;
  campo: "precio" | "volumen";
  tipo_condicion: "mayor_que" | "menor_que" | string;
  valor: number;
  activo: boolean;
  activada_at: string | null;
  user_id: number;
  created_at: string;
}

export interface AlertaRango {
  id: number;
  ticker: string;
  campo: "precio" | "volumen";
  valor_minimo: number;
  valor_maximo: number;
  activo: boolean;
  activada_at: string | null;
  user_id: number;
  created_at: string;
}

export interface AlertaPorcentaje {
  id: number;
  ticker: string;
  campo: "precio" | "volumen";
  porcentaje_cambio: number;
  precio_referencia: number;
  activo: boolean;
  activada_at: string | null;
  user_id: number;
  created_at: string;
}

export interface AlertasResponse {
  simple: AlertaSimple[];
  rango: AlertaRango[];
  porcentaje: AlertaPorcentaje[];
}

export interface AlertaActivada {
  id: string;
  mensaje: string;
}

export interface AlertasActivadasResponse {
  alertas_evaluadas: number;
  alertas_activadas: AlertaActivada[];
  total_activadas: number;
}

export interface TickerSeguimiento {
  symbol: string;
  price: number;
  change: number;
}

export interface TickersSeguimientoResponse {
  tickers: TickerSeguimiento[];
}

export interface CrearAlertaSimplePayload {
  ticker: string;
  campo: "precio" | "volumen";
  tipo_condicion: "mayor_que" | "menor_que" | string;
  valor: number;
}

export interface CrearAlertaRangoPayload {
  ticker: string;
  campo: "precio" | "volumen";
  valor_minimo: number;
  valor_maximo: number;
}

export interface CrearAlertaPorcentajePayload {
  ticker: string;
  campo: "precio" | "volumen";
  porcentaje_cambio: number;
}

export type TipoAlerta = "simple" | "rango" | "porcentaje";

export type AlertaItem = (
  | (AlertaSimple & { tipo: "simple" })
  | (AlertaRango & { tipo: "rango" })
  | (AlertaPorcentaje & { tipo: "porcentaje" })
);
