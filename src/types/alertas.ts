// Archivo para interfaces
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
  //   rango: any[];
  //   porcentaje: any[];
  //   compuesta: any[];
}

export interface AlertasActivadasResponse {
  alertas_evaluadas: number;
  alertas_activadas: Array<{ id: string; mensaje: string }>;
  total_activadas: number;
}
