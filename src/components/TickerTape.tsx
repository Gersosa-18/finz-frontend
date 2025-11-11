import React, { useState, useEffect, useRef } from "react";
import { alertasAPI } from "../services/api";
import "./TickerTape.css";

const TickerTape: React.FC = () => {
  const [tickers, setTickers] = useState<any[]>([]);
  const prevData = useRef<any[]>([]);
  const isMounted = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await alertasAPI.getTickersSeguimiento();
        const nuevos = res.data.tickers;

        if (!arraysIguales(prevData.current, nuevos)) {
          prevData.current = nuevos;

          if (isMounted.current) {
            setTickers(nuevos);
          } else {
            setTickers(nuevos);
            isMounted.current = true;
          }
        }
      } catch (err) {}
    };

    cargar();
    const int = setInterval(cargar, 30000);
    return () => clearInterval(int);
  }, []);

  const duplicados = React.useMemo(() => [...tickers, ...tickers], [tickers]);

  if (!tickers.length) return null;

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape">
        {duplicados.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="ticker-item">
            <span className="ticker-symbol">{t.symbol}</span>
            <span className="ticker-price">${t.price}</span>
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
      x.symbol === b[i].symbol && // comparar simbol
      x.price === b[i].price && // comparar precio
      x.change === b[i].change // comparar cambio
  );
}
