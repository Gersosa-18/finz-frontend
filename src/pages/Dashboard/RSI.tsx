import React, { useState, useEffect, useCallback, useMemo } from "react";
import { rsiAPI, getApiErrorMessage } from "../../services/api";
import "./RSI.css";
import { RSIData } from "../../types/rsi";

interface RSIGaugeProps {
  value: number | null;
  color: string;
}

// Subcomponente memoizado para el Gauge semicircular SVG ligero (cero dependencias externas)
const RSIGauge: React.FC<RSIGaugeProps> = React.memo(({ value, color }) => {
  const val = value !== null ? Math.min(Math.max(value, 0), 100) : null;
  const arcLength = 125.66; // pi * r (r = 40)
  const offset = val !== null ? arcLength * (1 - val / 100) : arcLength;

  return (
    <div className="rsi-gauge-wrapper">
      <svg viewBox="0 0 100 55" className="rsi-gauge-svg">
        {/* Pista de fondo */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Arco activo coloreado */}
        {val !== null && (
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        )}
        {/* Valor central */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fill={val !== null ? color : "#64748b"}
          fontSize="18"
          fontWeight="bold"
        >
          {val !== null ? val.toFixed(1) : "--"}
        </text>
      </svg>

      {/* Barra horizontal con aguja de precisión */}
      <div className="rsi-horizontal-bar">
        <div className="rsi-bar-track">
          <div className="rsi-zone-marker sv" title="Sobreventa (30)" />
          <div className="rsi-zone-marker sc" title="Sobrecompra (70)" />
          {val !== null && (
            <div
              className="rsi-needle"
              style={{
                left: `${val}%`,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

RSIGauge.displayName = "RSIGauge";

const RSI: React.FC = () => {
  const [tickers, setTickers] = useState<RSIData[]>([]);
  const [nuevoTicker, setNuevoTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [orden, setOrden] = useState<"AZ" | "RSI">("AZ");
  const [timeframe, setTimeframe] = useState<"1D" | "1W">("1D");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "sobreventa" | "sobrecompra">("todos");

  const cargar = useCallback(async () => {
    try {
      const res = await rsiAPI.getMisRSI();
      setTickers(res.data.tickers);
    } catch (err: unknown) {
      console.error("Error cargando RSI:", getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 60000);
    return () => clearInterval(interval);
  }, [cargar]);

  const agregar = async () => {
    const ticker = nuevoTicker.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    try {
      await rsiAPI.agregar(ticker);
      setNuevoTicker("");
      await cargar();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Error al agregar ticker"));
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (ticker: string) => {
    if (!window.confirm(`¿Eliminar ${ticker}?`)) return;
    try {
      await rsiAPI.eliminar(ticker);
      await cargar();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Error al eliminar"));
    }
  };

  const getEstadoInfo = (signal: string | null, value: number | null) => {
    if (value === null) {
      return { estado: "neutral", label: "Sin datos", color: "#64748b" };
    }
    if (value <= 30 || signal === "sobreventa") {
      return { estado: "sobreventa", label: "Sobreventa Oportunidad", color: "#00c08b" };
    }
    if (value >= 70 || signal === "sobrecompra") {
      return { estado: "sobrecompra", label: "Sobrecompra", color: "#f59e0b" };
    }
    if (signal?.includes("acercandose a sobreventa")) {
      return { estado: "acercando-sv", label: "Acercándose a SV", color: "#10b981" };
    }
    if (signal?.includes("acercandose a sobrecompra")) {
      return { estado: "acercando-sc", label: "Acercándose a SC", color: "#fbbf24" };
    }
    return { estado: "neutral", label: "Neutral", color: "#a78bfa" };
  };

  const lista = useMemo(() => {
    let result = [...tickers];
    if (filtroEstado === "sobreventa") {
      result = result.filter((t) => t.rsi_value !== null && t.rsi_value <= 35);
    } else if (filtroEstado === "sobrecompra") {
      result = result.filter((t) => t.rsi_value !== null && t.rsi_value >= 65);
    }
    return result.sort((a, b) =>
      orden === "AZ"
        ? a.ticker.localeCompare(b.ticker)
        : (a.rsi_value ?? 999) - (b.rsi_value ?? 999)
    );
  }, [tickers, orden, filtroEstado]);

  return (
    <section className="rsi-container">
      <div className="rsi-header-mobile">
        <h2>Monitor RSI</h2>
        {/* Selector de temporalidad táctil */}
        <div className="rsi-timeframes">
          <button
            className={`rsi-pill-btn ${timeframe === "1D" ? "active" : ""}`}
            onClick={() => setTimeframe("1D")}
          >
            1D
          </button>
          <button
            className={`rsi-pill-btn ${timeframe === "1W" ? "active" : ""}`}
            onClick={() => setTimeframe("1W")}
          >
            1W
          </button>
        </div>
      </div>

      {/* Píldoras de filtro rápido */}
      <div className="rsi-filters">
        <button
          className={`rsi-filter-chip ${filtroEstado === "todos" ? "active" : ""}`}
          onClick={() => setFiltroEstado("todos")}
        >
          Todos ({tickers.length})
        </button>
        <button
          className={`rsi-filter-chip sobreventa ${filtroEstado === "sobreventa" ? "active" : ""}`}
          onClick={() => setFiltroEstado("sobreventa")}
        >
          Sobreventa &lt;30
        </button>
        <button
          className={`rsi-filter-chip sobrecompra ${filtroEstado === "sobrecompra" ? "active" : ""}`}
          onClick={() => setFiltroEstado("sobrecompra")}
        >
          Sobrecompra &gt;70
        </button>
      </div>

      {/* Barra compacta para agregar ticker */}
      <div className="rsi-agregar">
        <input
          placeholder="Ticker (ej: AAPL, NVDA)"
          value={nuevoTicker}
          onChange={(e) => setNuevoTicker(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <button onClick={agregar} disabled={loading}>
          {loading ? "Agregando..." : "+ Agregar"}
        </button>
      </div>

      {tickers.length === 0 ? (
        <p className="empty-state">No tenés tickers monitoreados</p>
      ) : (
        <>
          <div className="rsi-toolbar">
            <select
              className="rsi-orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value as "AZ" | "RSI")}
            >
              <option value="AZ">Ordenar: A → Z</option>
              <option value="RSI">Ordenar: RSI</option>
            </select>
          </div>

          <div className="rsi-grid">
            {lista.map((t) => {
              const { estado, label, color } = getEstadoInfo(t.signal, t.rsi_value);

              return (
                <div key={t.ticker} className={`rsi-card ${estado}`}>
                  <button
                    className="btn-eliminar-rsi"
                    onClick={() => eliminar(t.ticker)}
                    title="Eliminar ticker"
                  >
                    ✕
                  </button>
                  <div className="rsi-card-content">
                    <div className="rsi-card-info">
                      <div className="rsi-ticker">{t.ticker}</div>
                      <span className={`rsi-badge ${estado}`}>{label}</span>
                      <div className="rsi-info">{t.proxima_actualizacion}</div>
                    </div>
                    <RSIGauge
                      value={t.tiene_datos ? t.rsi_value : null}
                      color={color}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rsi-guia">
            <strong>💡 Guía RSI:</strong> &lt;30 Sobreventa (Oportunidad) | &gt;70 Sobrecompra (Alerta) | 30-70 Neutral
          </div>
        </>
      )}
    </section>
  );
};

export default RSI;
