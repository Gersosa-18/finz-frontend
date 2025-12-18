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
