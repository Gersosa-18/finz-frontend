import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { alertasAPI, getApiErrorMessage } from "../../services/api";
import CrearAlerta from "../CrearAlerta";
import "../Dashboard.css";
import { initNotifications, notify } from "../../utils/notifications";
import { TickerItem } from "../../components/TickerItem";
import { Plus } from "lucide-react";
import {
  AlertaActivada,
  AlertaItem,
  AlertasResponse,
} from "../../types/alertas";

interface AlertasPageProps {
  onDataChange?: () => void;
}

interface BentoCardProps {
  ticker: string;
  alertasList: AlertaItem[];
  tickerInfo?: { price: number; change: number };
  onEliminarAlerta: (id: number) => void;
}

// Subcomponente memoizado para aislar el re-render por hover a nivel de tarjeta individual
const BentoCard: React.FC<BentoCardProps> = React.memo(
  ({ ticker, alertasList, tickerInfo, onEliminarAlerta }) => {
    const [isHovered, setIsHovered] = useState(false);
    const tieneActivadas = alertasList.some((a) => a.activada_at);

    const tickerItemData = useMemo(
      () => ({
        symbol: ticker,
        price: tickerInfo?.price ?? "...",
        change: tickerInfo?.change ?? 0,
      }),
      [ticker, tickerInfo?.price, tickerInfo?.change]
    );

    return (
      <div
        className={`bento-card ${isHovered ? "expanded" : ""} ${
          tieneActivadas ? "has-activadas" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bento-header">
          <TickerItem ticker={tickerItemData} />
          <span className="alert-badge">{alertasList.length}</span>
        </div>
        <div
          className="bento-content"
          style={{
            display: isHovered ? "flex" : undefined,
          }}
        >
          {alertasList.map((a) => (
            <div
              key={a.id}
              className={`mini-alert ${a.activada_at ? "activada" : ""}`}
            >
              <span className="condicion">
                {a.tipo === "simple" &&
                  `${a.tipo_condicion === "mayor_que" ? ">" : "<"} $${a.valor}`}

                {a.tipo === "rango" && `$${a.valor_minimo} - $${a.valor_maximo}`}

                {a.tipo === "porcentaje" &&
                  (() => {
                    const simb = Number(a.porcentaje_cambio);
                    return `${simb >= 0 ? "↑ " : "↓ "}${Math.abs(simb)}%`;
                  })()}
              </span>

              {a.activada_at && <span className="badge-activada">✓</span>}
              <button
                className="btn-eliminar-mini"
                onClick={() => onEliminarAlerta(a.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => {
    if (prev.ticker !== next.ticker) return false;
    if (prev.tickerInfo?.price !== next.tickerInfo?.price) return false;
    if (prev.tickerInfo?.change !== next.tickerInfo?.change) return false;
    if (prev.alertasList.length !== next.alertasList.length) return false;
    for (let i = 0; i < prev.alertasList.length; i++) {
      if (
        prev.alertasList[i].id !== next.alertasList[i].id ||
        prev.alertasList[i].activada_at !== next.alertasList[i].activada_at
      ) {
        return false;
      }
    }
    return true;
  }
);

BentoCard.displayName = "BentoCard";

const Alertas: React.FC<AlertasPageProps> = ({ onDataChange }) => {
  const [alertas, setAlertas] = useState<AlertasResponse>({
    simple: [],
    rango: [],
    porcentaje: [],
  });
  const [alertasActivadas, setAlertasActivadas] = useState<AlertaActivada[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickerData, setTickerData] = useState<
    Record<string, { price: number; change: number }>
  >({});
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  const alertasPrevias = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  const cargarAlertas = useCallback(async () => {
    try {
      if (isInitialLoad.current) {
        setLoading(true);
      }
      // Carga concurrente con sincronización protegida en api.ts
      const [resAlertas, resTickets] = await Promise.all([
        alertasAPI.getMisAlertas(),
        alertasAPI.getTickersSeguimiento(),
      ]);
      setAlertas(resAlertas.data);

      const tickerMap: Record<string, { price: number; change: number }> = {};
      resTickets.data.tickers.forEach((t) => {
        tickerMap[t.symbol] = { price: t.price, change: t.change };
      });
      setTickerData(tickerMap);
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        setLoading(false);
      }

      // Evaluar alertas activadas en segundo plano
      const resActivadas = await alertasAPI.getActivadas();
      const nuevas = resActivadas.data.alertas_activadas || [];
      setAlertasActivadas(nuevas);
      nuevas.forEach((a) => {
        if (!alertasPrevias.current.has(a.id)) {
          notify("🔔 Alerta Finz", a.mensaje);
          alertasPrevias.current.add(a.id);
        }
      });
      onDataChange?.();
    } catch (err: unknown) {
      console.error("Error cargando alertas:", getApiErrorMessage(err));
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [onDataChange]);

  useEffect(() => {
  // Solo sincronizar push automáticamente si el usuario YA otorgó permiso previamente
  if ("Notification" in window && Notification.permission === "granted") {
    initNotifications();
  }
  
  cargarAlertas();
  const interval = setInterval(cargarAlertas, 30000);
  return () => clearInterval(interval);
}, [cargarAlertas]);

  const eliminarAlerta = useCallback(
    async (id: number) => {
      if (!window.confirm("¿Eliminar esta alerta?")) return;
      try {
        await alertasAPI.eliminar(id);
        cargarAlertas();
      } catch (err: unknown) {
        alert(getApiErrorMessage(err, "Error al eliminar alerta"));
      }
    },
    [cargarAlertas]
  );

  const handleAlertaCreada = useCallback(() => {
    setMostrarForm(false);
    cargarAlertas();
  }, [cargarAlertas]);

  // Agrupar alertas y ordenar tickers en un único cómputo memoizado
  const { alertasPorTicker, tickersOrdenados } = useMemo(() => {
    const acc: Record<string, AlertaItem[]> = {};

    alertas.simple.forEach((a) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "simple" });
    });

    alertas.rango.forEach((a) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "rango" });
    });

    alertas.porcentaje.forEach((a) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push({ ...a, tipo: "porcentaje" });
    });

    const ordenados = Object.keys(acc).sort();
    return { alertasPorTicker: acc, tickersOrdenados: ordenados };
  }, [alertas]);

  const totalAlertas =
    alertas.simple.length + alertas.rango.length + alertas.porcentaje.length;

  return (
    <section className="alertas-page">
      <h2>Mis Alertas ({totalAlertas})</h2>

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
          {alertasActivadas.map((a) => (
            <div key={a.id} style={{ marginTop: "5px" }}>
              {a.mensaje}
            </div>
          ))}
        </div>
      )}

      {typeof window !== "undefined" && "Notification" in window && notifPermission === "default" && (
        <button
          className="btn-notificaciones"
          onClick={async () => {
            await initNotifications();
            if ("Notification" in window) {
              setNotifPermission(Notification.permission);
            }
          }}
        >
          🔔 Habilitar Notificaciones de Precios
        </button>
      )}

      <button
        className="btn-nueva-alerta"
        onClick={() => setMostrarForm((prev) => !prev)}
        disabled={loading}
      >
        {mostrarForm ? (
          "Cancelar"
        ) : (
          <>
            <Plus size={16} strokeWidth={3} /> Nueva Alerta
          </>
        )}
      </button>

      {mostrarForm && (
        <CrearAlerta
          onAlertaCreada={handleAlertaCreada}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {totalAlertas === 0 ? (
        <p className="empty-state">No tienes alertas activas</p>
      ) : (
        <div className="bento-grid">
          {tickersOrdenados.map((ticker) => (
            <BentoCard
              key={ticker}
              ticker={ticker}
              alertasList={alertasPorTicker[ticker]}
              tickerInfo={tickerData[ticker]}
              onEliminarAlerta={eliminarAlerta}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(Alertas);
