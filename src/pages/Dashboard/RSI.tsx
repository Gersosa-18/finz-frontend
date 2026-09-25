import React, { useState, useEffect, useCallback, useMemo } from "react";
import { rsiAPI, getApiErrorMessage } from "../../services/api";
import "./RSI.css";
import { RSIData } from "../../types/rsi";

const RSI: React.FC = () => {
  const [tickers, setTickers] = useState<RSIData[]>([]);
  const [nuevoTicker, setNuevoTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [orden, setOrden] = useState<"AZ" | "RSI">("AZ");

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

  const getEstado = (signal: string | null) => {
    if (!signal) return "neutral";
    if (signal === "sobreventa") return "sobreventa";
    if (signal === "sobrecompra") return "sobrecompra";
    if (signal.includes("acercandose a sobreventa")) return "acercando-sv";
    if (signal.includes("acercandose a sobrecompra")) return "acercando-sc";
    return "neutral";
  };

  const lista = useMemo(() => {
    return [...tickers].sort((a, b) =>
      orden === "AZ"
        ? a.ticker.localeCompare(b.ticker)
        : (a.rsi_value ?? 999) - (b.rsi_value ?? 999)
    );
  }, [tickers, orden]);

  return (
    <section className="rsi-container">
      <h2>📈 RSI Monitor</h2>

      <div className="rsi-agregar">
        <input
          placeholder="Ticker (ej: AAPL)"
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
          <select
            className="rsi-orden"
            value={orden}
            onChange={(e) => setOrden(e.target.value as "AZ" | "RSI")}
          >
            <option value="AZ">A → Z</option>
            <option value="RSI">RSI</option>
          </select>

          <div className="rsi-grid">
            {lista.map((t) => {
              const estado = getEstado(t.signal);

              return (
                <div key={t.ticker} className={`rsi-card ${estado}`}>
                  <button
                    className="btn-eliminar-rsi"
                    onClick={() => eliminar(t.ticker)}
                  >
                    ✕
                  </button>
                  <div className="rsi-ticker">{t.ticker}</div>
                  <div className="rsi-value">
                    {t.tiene_datos ? t.rsi_value?.toFixed(2) : "--"}
                  </div>
                  <div className="rsi-estado">
                    {estado === "sobreventa" && "📉 SOBREVENTA"}
                    {estado === "acercando-sv" && "⚠️ ACERCÁNDOSE A SV"}
                    {estado === "sobrecompra" && "📈 SOBRECOMPRA"}
                    {estado === "acercando-sc" && "⚠️ ACERCÁNDOSE A SC"}
                    {estado === "neutral" && "➡️ NEUTRAL"}
                  </div>
                  <div className="rsi-info">{t.proxima_actualizacion}</div>
                  {t.tiene_datos && t.rsi_value && (
                    <div className="rsi-bar">
                      <div className="zona-sv" />
                      <div className="zona-sc" />
                      <div
                        className="indicator"
                        style={{ left: `${t.rsi_value}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="rsi-guia">
            <strong>💡 RSI:</strong> &lt;30 Sobreventa | &gt;70 Sobrecompra |
            30-70 Neutral
          </div>
        </>
      )}
    </section>
  );
};

export default RSI;
