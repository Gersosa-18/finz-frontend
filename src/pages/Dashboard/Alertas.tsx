import React, { useState, useEffect, useRef, useCallback } from "react";
import { alertasAPI } from "../../services/api";
import CrearAlerta from "../CrearAlerta";
import "../Dashboard.css";
import { initNotifications, notify } from "../../utils/notifications";
import { TickerItem } from "../../components/TickerItem";

interface AlertasPageProps {
  onDataChange?: () => void;
}

const Alertas: React.FC<AlertasPageProps> = ({ onDataChange }) => {
  const [alertas, setAlertas] = useState<any>({
    simple: [],
    rango: [],
    porcentaje: [],
  });
  const [alertasActivadas, setAlertasActivadas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickerData, setTickerData] = useState<Record<string, any>>({});
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  const alertasPrevias = useRef<Set<string>>(new Set());

  const cargarAlertas = useCallback(async () => {
    try {
      setLoading(true);
      // Carga rápida
      const [resAlertas, resTickets] = await Promise.all([
        alertasAPI.getMisAlertas(),
        alertasAPI.getTickersSeguimiento(),
      ]);
      setAlertas(resAlertas.data);

      const tickerMap: Record<string, any> = {};
      resTickets.data.tickers.forEach((t: any) => {
        tickerMap[t.symbol] = { price: t.price, change: t.change };
      });
      setTickerData(tickerMap);
      setLoading(false); // UI sin esperar las getActivadas

      // Evaluar en segundo plano
      const resActivadas = await alertasAPI.getActivadas();
      const nuevas = resActivadas.data.alertas_activadas || [];
      setAlertasActivadas(nuevas);
      nuevas.forEach((a: any) => {
        if (!alertasPrevias.current.has(a.id)) {
          notify("🔔 Alerta Finz", a.mensaje);
          alertasPrevias.current.add(a.id);
        }
      });
      onDataChange?.();
    } catch (err) {
      console.error("Error cargando alertas:", err);
      setLoading(false);
    }
  }, [onDataChange]);

  useEffect(() => {
    initNotifications();
    cargarAlertas();
    const int = setInterval(cargarAlertas, 30000);
    return () => clearInterval(int);
  }, [cargarAlertas]);

  const eliminarAlerta = async (id: number, tipo: string) => {
    if (!window.confirm("¿Eliminar esta alerta?")) return;
    try {
      await alertasAPI.eliminar(id, tipo);
      cargarAlertas();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const handleAlertaCreada = () => {
    setMostrarForm(false);
    cargarAlertas();
  };

  // Agrupar alertas por ticker
  const alertasPorTicker = React.useMemo(() => {
    const acc: any = {};

    // agrugar alertas simples
    alertas.simple.forEach((a: any) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "simple" });
    });

    // agrupar alertas de rango
    alertas.rango.forEach((a: any) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "rango" });
    });

    // agrupar alertas de porcentaje
    alertas.porcentaje.forEach((a: any) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "porcentaje" });
    });

    return acc;
  }, [alertas.simple, alertas.rango, alertas.porcentaje]);
  const tickersOrdenados = React.useMemo(() => {
    return Object.keys(alertasPorTicker).sort();
  }, [alertasPorTicker]);

  return (
    <section className="alertas-page">
      <h2>
        Mis Alertas (
        {alertas.simple.length +
          alertas.rango.length +
          alertas.porcentaje.length}
        )
      </h2>

      {alertasActivadas.length > 0 && (
        <div
          style={{
            background: "#00aa76",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <strong>🔔 Alertas activadas:</strong>
          {alertasActivadas.map((a: any, i: number) => (
            <div key={i} style={{ marginTop: "5px" }}>
              {a.mensaje}
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-nueva-alerta"
        onClick={() => setMostrarForm(!mostrarForm)}
        disabled={loading}
      >
        {mostrarForm ? "Cancelar" : "+ Nueva Alerta"}
      </button>

      {mostrarForm && (
        <CrearAlerta
          onAlertaCreada={handleAlertaCreada}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {alertas.simple.length === 0 &&
      alertas.rango.length === 0 &&
      alertas.porcentaje.length === 0 ? (
        <p className="empty-state">No tienes alertas activas</p>
      ) : (
        <div className="bento-grid">
          {tickersOrdenados.map((ticker) => {
            const alertasList = alertasPorTicker[ticker];
            const tieneActivadas = alertasList.some((a: any) => a.activada_at);
            return (
              <div
                key={ticker}
                className={`bento-card ${
                  hoveredTicker === ticker ? "expanded" : ""
                } ${tieneActivadas ? "has-activadas" : ""}`}
                onMouseEnter={() => setHoveredTicker(ticker)}
                onMouseLeave={() => setHoveredTicker(null)}
              >
                <div className="bento-header">
                  {tickerData[ticker] && (
                    <TickerItem
                      ticker={{
                        symbol: ticker,
                        price: tickerData[ticker]?.price ?? "...",
                        change: tickerData[ticker]?.change ?? 0,
                      }}
                    />
                  )}
                  <span className="alert-badge">{alertasList.length}</span>
                </div>
                <div
                  className="bento-content"
                  style={{
                    display: hoveredTicker === ticker ? "flex" : "none",
                  }}
                >
                  {alertasList.map((a: any) => (
                    <div
                      key={a.id}
                      className={`mini-alert ${
                        a.activada_at ? "activada" : ""
                      }`}
                    >
                      <span className="condicion">
                        {a.tipo === "simple" &&
                          `${a.tipo_condicion === "mayor_que" ? ">" : "<"} $${
                            a.valor
                          }`}

                        {a.tipo === "rango" &&
                          `$${a.valor_minimo} - $${a.valor_maximo}`}

                        {a.tipo === "porcentaje" &&
                          (() => {
                            const simb = Number(a.porcentaje_cambio);
                            return `${simb >= 0 ? "↑ " : "↓ "}${Math.abs(
                              simb,
                            )}%`;
                          })()}
                      </span>

                      {a.activada_at && (
                        <span className="badge-activada">✓</span>
                      )}
                      <button
                        className="btn-eliminar-mini"
                        onClick={() => eliminarAlerta(a.id, a.tipo)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Alertas;
