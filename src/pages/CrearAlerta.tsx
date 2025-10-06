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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-alerta-form">
      <input
        placeholder="Ticker (ej: AAPL)"
        value={form.ticker}
        onChange={(e) => setForm({ ...form, ticker: e.target.value })}
        required
      />
      <select
        value={form.condicion}
        onChange={(e) => setForm({ ...form, condicion: e.target.value })}
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
      />
      <div className="form-actions">
        <button type="submit">Crear</button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CrearAlerta;
