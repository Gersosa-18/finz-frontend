import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { alertasAPI, authAPI } from "../services/api";
import CrearAlerta from "./CrearAlerta";
import "./Dashboard.css";

const Dashboard = () => {
  const [alertas, setAlertas] = useState<any>({ simple: [] });
  const [alertasActivadas, setAlertasActivadas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarAlertas();
    const int = setInterval(cargarAlertas, 30000);
    return () => clearInterval(int);
  }, []);

  const cargarAlertas = async () => {
    try {
      const res = await alertasAPI.getMisAlertas();
      setAlertas(res.data);
      const activadas = await alertasAPI.getActivadas();
      setAlertasActivadas(activadas.data.alertas_activadas || []);
    } catch (err) {
      navigate("/login");
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Finz</h1>
        <button
          onClick={() => {
            authAPI.logout();
            navigate("/login");
          }}
        >
          Salir
        </button>
      </header>
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
      >
        {mostrarForm ? "Cancelar" : "+ Nueva Alerta"}
      </button>

      {mostrarForm && (
        <CrearAlerta
          onAlertaCreada={handleAlertaCreada}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      <section className="alertas-section">
        <h2>Mis Alertas ({alertas.simple.length})</h2>
        {alertas.simple.length === 0 ? (
          <p className="empty-state">No tienes alertas activas</p>
        ) : (
          <div className="alertas-list">
            {alertas.simple.map((a: any) => (
              <div key={a.id} className="alerta-card">
                <div className="alerta-info">
                  <span className="ticker">{a.ticker}</span>
                  <span className="condicion">
                    Precio {a.tipo_condicion === "mayor_que" ? ">" : "<"} $
                    {a.valor}
                  </span>
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
        )}
      </section>
    </div>
  );
};

export default Dashboard;
