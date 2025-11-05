import React, { useState } from "react";
import { alertasAPI } from "../services/api";

interface CrearAlertaProps {
  onAlertaCreada: () => void;
  onCancelar: () => void;
}

const CrearAlerta: React.FC<CrearAlertaProps> = ({
  onAlertaCreada,
  onCancelar,
}) => {
  const [form, setForm] = useState({
    ticker: "",
    valor: "",
    condicion: "mayor_que",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await alertasAPI.crearSimple({
        ticker: form.ticker.toUpperCase(),
        campo: "precio",
        tipo_condicion: form.condicion,
        valor: parseFloat(form.valor),
      });
      onAlertaCreada();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al crear alerta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-alerta-form">
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
      <select
        value={form.condicion}
        onChange={(e) => setForm({ ...form, condicion: e.target.value })}
        disabled={loading}
      >
        <option value="mayor_que">Mayor que (&gt;)</option>
        <option value="menor_que">Menor que (&lt;)</option>
      </select>
      <input
        placeholder="Precio"
        type="number"
        step="0.01"
        value={form.valor}
        onChange={(e) => setForm({ ...form, valor: e.target.value })}
        required
        disabled={loading}
      />
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
