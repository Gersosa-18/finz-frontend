import React, { useState, useEffect } from "react";
import api from "../../services/api";
import CrearAlerta from "../CrearAlerta";
import "./Mag7.css";
import { Mag7Entry, Mag7Response } from "../../types/mag7";

const FILTROS = ["Todo", "Mag 7", "Índices", "Sectores", "Mis Seguidos"];

const Mag7: React.FC = () => {
  const [data, setData] = useState<Mag7Entry[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Mag 7");
  const [alertaModal, setAlertaModal] = useState<{
    ticker: string;
    price?: number;
  } | null>(null);

  useEffect(() => {
    let isCurrent = true;

    api
      .get<Mag7Response>("/mercado/ytd")
      .then((res) => {
        if (!isCurrent) return;
        setData(res.data.data ?? []);
        setYear(res.data.year ?? new Date().getFullYear());
      })
      .catch(() => {
        // Silencioso
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (loading) return <p className="mag7-msg">Cargando Pulso de Mercado...</p>;
  if (!data.length) {
    return (
      <p className="mag7-msg">Sin datos - actualiza al cierre del mercado.</p>
    );
  }

  const spy = data.find((d) => d.ticker === "SPY");
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.ytd)), 1);

  return (
    <section className="mag7-wrap">
      <div className="mag7-header">
        <h2>Pulso de Mercado</h2>
        <span className="mag7-badge">YTD {year}</span>
      </div>

      {/* Chips de Categorías */}
      <div className="mag7-chips">
        {FILTROS.map((f) => (
          <button
            key={f}
            className={`mag7-chip ${filtro === f ? "active" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mag7-list">
        {data.map((entry, idx) => {
          const isSpy = entry.ticker === "SPY";
          const isAvg = entry.ticker === "MAG7~";
          const positive = entry.ytd >= 0;
          const barPct = (Math.abs(entry.ytd) / maxAbs) * 100;
          const beatsSpy = !!spy && entry.ytd > spy.ytd;

          return (
            <div
              key={entry.ticker}
              className={`mag7-card ${isSpy ? "spy" : ""} ${isAvg ? "avg" : ""}`}
            >
              <div className="mag7-card-left">
                <span className="mag7-rank">{idx + 1}.</span>
                <div className="mag7-info">
                  <span className="mag7-ticker">
                    {isAvg ? "Promedio Mag 7" : entry.ticker}
                  </span>
                  {entry.price && (
                    <span className="mag7-price">
                      ${entry.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mag7-bar-bg">
                <div
                  className={`mag7-bar ${positive ? "up" : "down"} ${
                    beatsSpy && !isSpy ? "beats" : ""
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>

              <span className={`mag7-pct ${positive ? "up" : "down"}`}>
                {positive ? "+" : ""}
                {entry.ytd.toFixed(2)}%
              </span>

              {!isAvg && (
                <button
                  className="btn-card-alerta"
                  onClick={() =>
                    setAlertaModal({
                      ticker: entry.ticker,
                      price: entry.price ?? undefined,
                    })
                  }
                >
                  + Alerta
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mag7-note">
        MAG7 avg = promedio simple · Rendimiento comparado contra S&P 500 (SPY)
      </p>

      {/* Modal Bottom Sheet Nueva Alerta */}
      {alertaModal && (
        <CrearAlerta
          initialTicker={alertaModal.ticker}
          initialPrice={alertaModal.price}
          onAlertaCreada={() => setAlertaModal(null)}
          onCancelar={() => setAlertaModal(null)}
        />
      )}
    </section>
  );
};

export default React.memo(Mag7);
