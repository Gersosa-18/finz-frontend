import React, { useState, useEffect } from "react";
import { eventosAPI } from "../../services/api";
import "./Eventos.css";

const Eventos = () => {
  const [eventos, setEventos] = useState<any>({ macro: [], micro: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const res = await eventosAPI.getMisEventos();
      setEventos(res.data);
    } catch (err) {
      console.error("Error cargando eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="eventos-page">
      <h2>Próximos Eventos</h2>

      <div className="eventos-macro">
        <h3>📊 Eventos Macro ({eventos.macro.length})</h3>
        {eventos.macro.length === 0 ? (
          <p className="empty-state">Sin eventos macro próximos</p>
        ) : (
          eventos.macro.map((e: any) => (
            <div key={e.fecha} className="evento-card">
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
          eventos.micro.map((e: any) => (
            <div key={`${e.ticker}-${e.fecha}`} className="evento-card">
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
