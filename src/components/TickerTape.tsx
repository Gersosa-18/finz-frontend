import React, { useState, useEffect, useRef, useMemo } from "react";
import { alertasAPI } from "../services/api";
import { TickerSeguimiento } from "../types/alertas";
import { TickerItem } from "./TickerItem";
import "./TickerTape.css";

function areTickersEqual(
  a: TickerSeguimiento[],
  b: TickerSeguimiento[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (x, i) =>
      x.symbol === b[i].symbol &&
      x.price === b[i].price &&
      x.change === b[i].change
  );
}

const TickerTape: React.FC = () => {
  const [tickers, setTickers] = useState<TickerSeguimiento[]>([]);
  const [priceChanges, setPriceChanges] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const prevData = useRef<TickerSeguimiento[]>([]);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const cargar = async () => {
      try {
        const res = await alertasAPI.getTickersSeguimiento();
        const nuevos = res.data.tickers;

        if (!isCurrent) return;

        if (!areTickersEqual(prevData.current, nuevos)) {
          const changes: Record<string, "up" | "down" | null> = {};
          nuevos.forEach((ticker) => {
            const prev = prevData.current.find(
              (t) => t.symbol === ticker.symbol
            );
            if (
              prev &&
              prev.price != null &&
              ticker.price != null &&
              prev.price !== ticker.price
            ) {
              changes[ticker.symbol] =
                ticker.price > prev.price ? "up" : "down";
            }
          });

          prevData.current = nuevos;
          setPriceChanges(changes);
          setTickers(nuevos);

          if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
          }
          resetTimeoutRef.current = setTimeout(() => {
            if (isCurrent) {
              setPriceChanges({});
            }
          }, 1000);
        }
      } catch (err) {
        // Silently swallow background ticker tape polling errors
      }
    };

    cargar();
    const interval = setInterval(cargar, 30000);

    return () => {
      isCurrent = false;
      clearInterval(interval);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Multiplicar para asegurar que siempre haya contenido visible en loop continuo
  const duplicados = useMemo(() => {
    if (!tickers.length) return [];
    const repeticiones = tickers.length <= 3 ? 6 : 4;
    return Array(repeticiones).fill(tickers).flat();
  }, [tickers]);

  const duracion = useMemo(() => tickers.length * 5, [tickers.length]);

  if (!tickers.length) return null;

  return (
    <div className="ticker-tape-container">
      <div
        className="ticker-tape"
        style={
          { "--animation-duration": `${duracion}s` } as React.CSSProperties
        }
      >
        {duplicados.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="ticker-item">
            <TickerItem ticker={t} priceChange={priceChanges[t.symbol]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TickerTape);
