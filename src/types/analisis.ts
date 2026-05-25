export interface AnalisisResponse {
  ticker: string;
  timeframe: string;
  agente_tecnico: string;
  agente_fundamental: string;
  moderador: string;
  veredicto: "COMPRAR" | "ESPERAR" | "NO_ENTRAR";
}
