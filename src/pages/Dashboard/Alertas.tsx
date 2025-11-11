import React, { useState, useEffect, useRef } from "react";
import { alertasAPI } from "../../services/api";
import CrearAlerta from "../CrearAlerta";
import "../Dashboard.css";
import { initNotifications, notify } from "../../utils/notifications";

interface AlertasPageProps {
  onDataChange?: () => void;
}

const Alertas: React.FC<AlertasPageProps> = ({ onDataChange }) => {
  const [alertas, setAlertas] = useState<any>({ simple: [] });
  const [alertasActivadas, setAlertasActivadas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const alertasPrevias = useRef<Set<string>>(new Set());

  useEffect(() => {
    initNotifications();
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const [resAlertas, resActivadas] = await Promise.all([
        alertasAPI.getMisAlertas(),
        alertasAPI.getActivadas(),
      ]);
      setAlertas(resAlertas.data);

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
    } finally {
      setLoading(false);
    }
  };

  const eliminarAlerta = async (id: number) => {
    if (!window.confirm("¿Eliminar esta alerta?")) return;
    try {
      await alertasAPI.eliminar(id);
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
    return alertas.simple.reduce((acc: any, a: any) => {
      if (!acc[a.ticker]) acc[a.ticker] = [];
      acc[a.ticker].push(a);
      return acc;
    }, {});
  }, [alertas.simple]);

  return (
    <section className="alertas-page">
      <h2>Mis Alertas ({alertas.simple.length})</h2>

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

      {alertas.simple.length === 0 ? (
        <p className="empty-state">No tienes alertas activas</p>
      ) : (
        <div className="alertas-list">
          {Object.entries(alertasPorTicker).map(
            ([ticker, alertasList]: [string, any]) => (
              <div key={ticker} style={{ marginBottom: "25px" }}>
                <h3
                  style={{
                    color: "#7a4ec6",
                    marginBottom: "10px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {ticker}
                </h3>
                {alertasList.map((a: any) => (
                  <div
                    key={a.id}
                    className={`alerta-card ${a.activada_at ? "activada" : ""}`}
                  >
                    <div className="alerta-info">
                      <span className="condicion">
                        Precio {a.tipo_condicion === "mayor_que" ? ">" : "<"} $
                        {a.valor}
                      </span>
                      {a.activada_at && (
                        <span className="badge-activada">✓ ACTIVADA</span>
                      )}
                    </div>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarAlerta(a.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default Alertas;
