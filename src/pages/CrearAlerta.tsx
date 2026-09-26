import React, { useState } from "react";
import { alertasAPI, getApiErrorMessage } from "../services/api";
import { TipoAlerta } from "../types/alertas";
import "./CrearAlerta.css";

interface CrearAlertaProps {
  onAlertaCreada: () => void;
  onCancelar: () => void;
  initialTicker?: string;
  initialPrice?: number;
}

const CrearAlerta: React.FC<CrearAlertaProps> = ({
  onAlertaCreada,
  onCancelar,
  initialTicker = "",
  initialPrice,
}) => {
  const [ticker, setTicker] = useState(initialTicker);
  const [tipoAlerta, setTipoAlerta] = useState<TipoAlerta>("simple");
  const [condicion, setCondicion] = useState<"mayor_que" | "menor_que">("mayor_que");
  const [valor, setValor] = useState(
    initialPrice ? (initialPrice * 1.05).toFixed(2) : "100.00"
  );
  const [valorMinimo, setValorMinimo] = useState(
    initialPrice ? (initialPrice * 0.95).toFixed(2) : "90.00"
  );
  const [valorMaximo, setValorMaximo] = useState(
    initialPrice ? (initialPrice * 1.05).toFixed(2) : "110.00"
  );
  const [porcentajeCambio, setPorcentajeCambio] = useState("5");
  const [repetir, setRepetir] = useState(true);
  const [loading, setLoading] = useState(false);

  const adjustValor = (percentDelta: number) => {
    const current = parseFloat(valor) || (initialPrice ?? 100);
    const next = current * (1 + percentDelta / 100);
    setValor(next.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(true);

    try {
      if (tipoAlerta === "simple") {
        await alertasAPI.crearSimple({
          ticker: t,
          campo: "precio",
          tipo_condicion: condicion,
          valor: parseFloat(valor),
        });
      } else if (tipoAlerta === "rango") {
        await alertasAPI.crearRango({
          ticker: t,
          campo: "precio",
          valor_minimo: parseFloat(valorMinimo),
          valor_maximo: parseFloat(valorMaximo),
        });
      } else if (tipoAlerta === "porcentaje") {
        await alertasAPI.crearPorcentaje({
          ticker: t,
          campo: "precio",
          porcentaje_cambio: parseFloat(porcentajeCambio),
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
    <div className="sheet-overlay" onClick={onCancelar}>
      <div className="sheet-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div>
            <h3 className="sheet-title">
              {ticker ? `Nueva Alerta para ${ticker}` : "Nueva Alerta"}
            </h3>
            <span className="sheet-sub">Configuración de precio</span>
          </div>
          <button type="button" className="sheet-close-btn" onClick={onCancelar}>
            ✕
          </button>
        </div>

        {/* Segmented Tabs: Simple / Rango / Porcentaje */}
        <div className="sheet-tabs">
          {(["simple", "rango", "porcentaje"] as TipoAlerta[]).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`sheet-tab ${tipoAlerta === tipo ? "active" : ""}`}
              onClick={() => setTipoAlerta(tipo)}
            >
              {tipo === "simple" && "Simple"}
              {tipo === "rango" && "Rango"}
              {tipo === "porcentaje" && "Porcentaje"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {!initialTicker && (
            <div className="sheet-input-row">
              <label className="sheet-input-label">Ticker</label>
              <input
                className="sheet-input"
                placeholder="Ej: NVDA, AAPL, SPY..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                required
              />
            </div>
          )}

          {tipoAlerta === "simple" && (
            <>
              <div className="sheet-input-row">
                <label className="sheet-input-label">Disparar cuando el precio sea</label>
                <select
                  className="sheet-input"
                  value={condicion}
                  onChange={(e) => setCondicion(e.target.value as "mayor_que" | "menor_que")}
                >
                  <option value="mayor_que">Mayor que (&gt;)</option>
                  <option value="menor_que">Menor que (&lt;)</option>
                </select>
              </div>

              {/* Stepper numérico idéntico a la imagen */}
              <div className="sheet-stepper-wrap">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => adjustValor(-1)}
                  title="-1%"
                >
                  -
                  <span className="step-sub">-1%</span>
                </button>
                <div className="sheet-price-center">
                  <input
                    type="number"
                    step="0.01"
                    className="sheet-big-price-input"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                  {initialPrice && (
                    <div className="sheet-sub">
                      Actual: ${initialPrice.toFixed(2)} (
                      {(((parseFloat(valor) - initialPrice) / initialPrice) * 100).toFixed(1)}
                      %)
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => adjustValor(1)}
                  title="+1%"
                >
                  +
                  <span className="step-sub">+1%</span>
                </button>
              </div>
            </>
          )}

          {tipoAlerta === "rango" && (
            <div className="sheet-input-row" style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className="sheet-input-label">Precio Mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  className="sheet-input"
                  value={valorMinimo}
                  onChange={(e) => setValorMinimo(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="sheet-input-label">Precio Máximo</label>
                <input
                  type="number"
                  step="0.01"
                  className="sheet-input"
                  value={valorMaximo}
                  onChange={(e) => setValorMaximo(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {tipoAlerta === "porcentaje" && (
            <div className="sheet-input-row">
              <label className="sheet-input-label">Porcentaje de cambio (±%)</label>
              <input
                type="number"
                step="0.1"
                className="sheet-input"
                placeholder="Ej: 5 para ±5%"
                value={porcentajeCambio}
                onChange={(e) => setPorcentajeCambio(e.target.value)}
                required
              />
            </div>
          )}

          <div className="sheet-row-toggle">
            <span>Repetir alerta</span>
            <div
              className={`switch-pill ${repetir ? "on" : ""}`}
              onClick={() => setRepetir(!repetir)}
            >
              <div className="switch-circle" />
            </div>
          </div>

          <div className="sheet-row-toggle">
            <span>Notificarme</span>
            <span className="sheet-subtag">Push notification</span>
          </div>

          <button type="submit" className="btn-activar-cta" disabled={loading}>
            {loading ? "Guardando..." : "Activar Alerta 🔔"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CrearAlerta);
