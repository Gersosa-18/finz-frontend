import React, { useState } from "react";
import { alertasAPI, getApiErrorMessage } from "../services/api";
import { TipoAlerta } from "../types/alertas";

interface CrearAlertaProps {
  onAlertaCreada: () => void;
  onCancelar: () => void;
}

interface FormState {
  ticker: string;
  valor: string;
  condicion: "mayor_que" | "menor_que";
  valor_minimo: string;
  valor_maximo: string;
  porcentaje_cambio: string;
}

const CrearAlerta: React.FC<CrearAlertaProps> = ({
  onAlertaCreada,
  onCancelar,
}) => {
  const [form, setForm] = useState<FormState>({
    ticker: "",
    valor: "",
    condicion: "mayor_que",
    valor_minimo: "",
    valor_maximo: "",
    porcentaje_cambio: "",
  });
  const [tipoAlerta, setTipoAlerta] = useState<TipoAlerta>("simple");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tickerUpper = form.ticker.trim().toUpperCase();

      if (tipoAlerta === "simple") {
        await alertasAPI.crearSimple({
          ticker: tickerUpper,
          campo: "precio",
          tipo_condicion: form.condicion,
          valor: parseFloat(form.valor),
        });
      } else if (tipoAlerta === "rango") {
        await alertasAPI.crearRango({
          ticker: tickerUpper,
          campo: "precio",
          valor_minimo: parseFloat(form.valor_minimo),
          valor_maximo: parseFloat(form.valor_maximo),
        });
      } else if (tipoAlerta === "porcentaje") {
        await alertasAPI.crearPorcentaje({
          ticker: tickerUpper,
          campo: "precio",
          porcentaje_cambio: parseFloat(form.porcentaje_cambio),
        });
      }
      onAlertaCreada();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Error al crear alerta"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-alerta-form">
      <select
        name="tipoAlerta"
        id="tipoAlerta"
        value={tipoAlerta}
        onChange={(e) => setTipoAlerta(e.target.value as TipoAlerta)}
        disabled={loading}
      >
        <option value="simple">Simple</option>
        <option value="rango">Rango</option>
        <option value="porcentaje">Porcentaje</option>
      </select>

      <input
        placeholder="Ticker (ej: AAPL, TSLA, NVDA...)"
        value={form.ticker}
        onChange={(e) => setForm({ ...form, ticker: e.target.value })}
        required
        minLength={1}
        maxLength={10}
        style={{
          borderColor:
            form.ticker && form.ticker.length > 10 ? "#c33" : undefined,
        }}
        disabled={loading}
      />

      {tipoAlerta === "simple" && (
        <select
          value={form.condicion}
          onChange={(e) =>
            setForm({
              ...form,
              condicion: e.target.value as "mayor_que" | "menor_que",
            })
          }
          disabled={loading}
        >
          <option value="mayor_que">Mayor que (&gt;)</option>
          <option value="menor_que">Menor que (&lt;)</option>
        </select>
      )}

      {tipoAlerta === "simple" && (
        <input
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          required
          disabled={loading}
        />
      )}

      {tipoAlerta === "rango" && (
        <input
          placeholder="Precio mínimo"
          type="number"
          step="0.01"
          value={form.valor_minimo}
          onChange={(e) => setForm({ ...form, valor_minimo: e.target.value })}
          required
          disabled={loading}
        />
      )}

      {tipoAlerta === "rango" && (
        <input
          placeholder="Precio máximo"
          type="number"
          step="0.01"
          value={form.valor_maximo}
          onChange={(e) => setForm({ ...form, valor_maximo: e.target.value })}
          required
          disabled={loading}
        />
      )}

      {tipoAlerta === "porcentaje" && (
        <input
          placeholder="Porcentaje de cambio (ej: 5 para ±5%)"
          type="number"
          step="0.01"
          value={form.porcentaje_cambio}
          onChange={(e) =>
            setForm({ ...form, porcentaje_cambio: e.target.value })
          }
          required
          disabled={loading}
        />
      )}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </button>
        <button type="button" onClick={onCancelar} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CrearAlerta;
