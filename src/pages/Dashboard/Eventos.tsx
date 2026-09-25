import React, { useState, useEffect, useCallback } from "react";
import { eventosAPI, getApiErrorMessage } from "../../services/api";
import { EventosResponse } from "../../types/eventos";
import "./Eventos.css";

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<EventosResponse>({
    macro: [],
    micro: [],
    tus_tickers: [],
  });
  const [loading, setLoading] = useState(false);

  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventosAPI.getMisEventos();
      setEventos(res.data);
    } catch (err: unknown) {
      console.error("Error cargando eventos:", getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  return (
    <section className="eventos-page">
      <h2>Próximos Eventos</h2>

      <div className="eventos-macro">
        <h3>📊 Eventos Macro ({eventos.macro.length})</h3>
        {eventos.macro.length === 0 ? (
          <p className="empty-state">Sin eventos macro próximos</p>
        ) : (
          eventos.macro.map((e, index) => (
            <div key={`${e.fecha}-${e.descripcion}-${index}`} className="evento-card">
              <span>{e.descripcion}</span>
              <span className="fecha">{e.fecha}</span>
            </div>
          ))
        )}
      </div>

      <div className="eventos-micro">
        <h3>📈 Earnings ({eventos.micro.length})</h3>
        {eventos.micro.length === 0 ? (
          <p className="empty-state">Sin earnings próximos en tus tickers</p>
        ) : (
          eventos.micro.map((e, index) => (
            <div key={`${e.ticker}-${e.fecha}-${index}`} className="evento-card">
              <span className="ticker">{e.ticker}</span>
              <span>{e.descripcion}</span>
              <span className="fecha">{e.fecha}</span>
            </div>
          ))
        )}
      </div>

      <button onClick={cargarEventos} disabled={loading} className="btn-sync">
        {loading ? "Actualizando..." : "🔄 Sincronizar"}
      </button>
    </section>
  );
};

export default Eventos;
