import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Mag7.css";
import { Mag7Entry, Mag7Response } from "../../types/mag7";

const Mag7 = () => {
  const [data, setData] = useState<Mag7Entry[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Mag7Response>("/mercado/ytd")
      .then((res) => {
        setData(res.data.data ?? []);
        setYear(res.data.year ?? new Date().getFullYear());
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <p className="mag7-msg">Cargando...</p>;
  if (!data.length)
    return (
      <p className="mag7-msg">Sin datos - actualiza al cierre del mercado.</p>
    );

  const spy = data.find((d) => d.ticker === "SPY");
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.ytd)), 1);
  return (
    <section className="mag7-wrap">
      <h2>📊 Mag 7 vs S&P 500 — YTD {year}</h2>

      {data.map((entry) => {
        const isSpy = entry.ticker === "SPY";
        const isAvg = entry.ticker === "MAG7~";
        const positive = entry.ytd >= 0;
        const barPct = (Math.abs(entry.ytd) / maxAbs) * 100;
        const beatsSpy = !!spy && entry.ytd > spy.ytd;

        return (
          <div
            key={entry.ticker}
            className={`mag7-row ${isSpy ? "spy" : ""} ${isAvg ? "avg" : ""}`}
          >
            <span className="mag7-ticker">
              {isAvg ? "MAG7 avg" : entry.ticker}
            </span>
            <div className="mag7-bar-bg">
              <div
                className={`mag7-bar ${positive ? "up" : "down"} ${beatsSpy && !isSpy ? "beats" : ""}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <span className={`mag7-pct ${positive ? "up" : "down"}`}>
              {positive ? "+" : ""}
              {entry.ytd.toFixed(2)}%
            </span>
            {entry.price && (
              <span className="mag7-price">${entry.price.toFixed(2)}</span>
            )}
          </div>
        );
      })}

      <p className="mag7-note">
        MAG7 avg = promedio simple · Actualización diaria al cierre
      </p>
    </section>
  );
};

export default Mag7;
