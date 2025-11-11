import React, { useState, useEffect, useRef } from "react";
import { alertasAPI } from "../services/api";
import "./TickerTape.css";

const TickerTape: React.FC = () => {
  const [tickers, setTickers] = useState<any[]>([]);
  const [priceChanges, setPriceChanges] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const prevData = useRef<any[]>([]);
  const isMounted = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await alertasAPI.getTickersSeguimiento();
        const nuevos = res.data.tickers;

        if (!arraysIguales(prevData.current, nuevos)) {
          const changes: Record<string, "up" | "down" | null> = {};
          nuevos.forEach((ticker: any) => {
            const prev = prevData.current.find(
              (t) => t.symbol === ticker.symbol
            );
            if (prev && prev.price !== ticker.price) {
              changes[ticker.symbol] =
                ticker.price > prev.price ? "up" : "down";
            }
          });

          setPriceChanges(changes);
          prevData.current = nuevos;

          if (isMounted.current) {
            setTickers(nuevos);
          } else {
            setTickers(nuevos);
            isMounted.current = true;
          }
          setTimeout(() => setPriceChanges({}), 1000);
        }
      } catch (err) {}
    };

    cargar();
    const int = setInterval(cargar, 30000);
    return () => clearInterval(int);
  }, []);

  // CLAVE: Multiplicar por 4 para asegurar que siempre haya contenido visible
  const duplicados = React.useMemo(() => {
    // Si hay pocos items, multiplicamos más veces
    const repeticiones = tickers.length <= 3 ? 6 : 4;
    return Array(repeticiones).fill(tickers).flat();
  }, [tickers]);

  if (!tickers.length) return null;

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape">
        {duplicados.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="ticker-item">
            <span className="ticker-symbol">{t.symbol}</span>
            <span className={`ticker-price ${priceChanges[t.symbol] || ""}`}>
              ${t.price}
            </span>
            <span
              className={`ticker-change ${
                t.change >= 0 ? "positive" : "negative"
              }`}
            >
              {t.change >= 0 ? "+" : ""}
              {t.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;

function arraysIguales(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  return a.every(
    (x, i) =>
      x.symbol === b[i].symbol &&
      x.price === b[i].price &&
      x.change === b[i].change
  );
}
