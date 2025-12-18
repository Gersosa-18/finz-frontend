export interface EventosResponse {
  macro: Array<{ descripcion: string; fecha: string }>;
  micro: Array<{ ticker: string; descripcion: string; fecha: string }>;
  tus_tickers: string[];
}
