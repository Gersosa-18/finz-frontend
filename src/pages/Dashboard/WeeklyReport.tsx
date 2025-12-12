import React, { useState, useEffect } from "react";
import { reporteAPI, ReporteResponse } from "../../services/api";
import "./WeeklyReport.css";

const WeeklyReport = () => {
  const [reportes, setReportes] = useState<ReporteResponse[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await reporteAPI.getSemanalActual();
      setReportes(res.data);
    } catch (err) {
      console.error("Error cargando reporte:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);

  if (loading)
    return (
      <div className="weekly-report-loading">
        <div className="spinner"></div>
        <p>Cargando reporte...</p>
      </div>
    );
  if (reportes.length === 0)
    return (
      <div className="weekly-report-empty">
        <p>📊 No hay reportes</p>
      </div>
    );
  const reporte = reportes[indiceActual];

  // Helper para formateo de fechas
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="weekly-report">
      {/* Header */}
      <div className="report-header">
        <h2>📈 Reporte Semanal</h2>
        <div>
          <button
            onClick={() => setIndiceActual((i) => i + 1)}
            disabled={indiceActual >= reportes.length - 1}
          >
            ← Ant
          </button>
          <span className="report-period">
            {formatFecha(reporte.fecha_inicio)} -{" "}
            {formatFecha(reporte.fecha_fin)}
          </span>
          <button
            onClick={() => setIndiceActual((i) => i - 1)}
            disabled={indiceActual === 0}
          >
            Sig →
          </button>
        </div>
      </div>

      {/* TODO: Mostrar contenido */}
      <div className="report-summary">
        <h3>Resumen Ejecutivo</h3>
        <div className="summary-content">
          {reporte.resumen_groq.split("\n\n").map((parrafo, idx) => (
            <p key={idx}>{parrafo}</p>
          ))}
        </div>
      </div>

      {/* TODO: Índices y sectores */}
      <div className="report-section">
        <h3>📊 Índices Principales</h3>
        <div className="indices-grid">
          {reporte.indices_json.map((indice) => (
            <div key={indice.ticker} className="indice-card">
              <span className="ticker">{indice.ticker}</span>
              <span
                className={`cambio ${
                  indice.cambio_porcentual >= 0 ? "positivo" : "negativo"
                }`}
              >
                {indice.cambio_porcentual >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(indice.cambio_porcentual).toFixed(2)}%
              </span>
              <span className="precio">${indice.precio_actual.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="report-section">
        <h3>🏆 Sectores Destacados</h3>

        <div className="sectores-container">
          {/* Mejores */}
          <div className="sectores-grupo">
            <h4 className="grupo-title positivo">🚀 Mejores</h4>
            {reporte.sectores_json
              .sort((a, b) => b.cambio_porcentual - a.cambio_porcentual)
              .slice(0, 3)
              .map((sector) => (
                <div key={sector.ticker} className="sector-item">
                  <div className="sector-info">
                    <span className="sector-ticker">{sector.ticker}</span>
                    <span className="sector-precio">
                      ${sector.precio_actual.toFixed(2)}
                    </span>
                  </div>
                  <span className="sector-cambio positivo">
                    +{sector.cambio_porcentual.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
          {/* Peores */}
          <div className="sectores-grupo">
            <h4 className="grupo-title negativo">📉 Más Débiles</h4>
            {reporte.sectores_json
              .sort((a, b) => a.cambio_porcentual - b.cambio_porcentual)
              .slice(0, 3)
              .map((sector) => (
                <div key={sector.ticker} className="sector-item">
                  <div className="sector-info">
                    <span className="sector-ticker">{sector.ticker}</span>
                    <span className="sector-precio">
                      ${sector.precio_actual.toFixed(2)}
                    </span>
                  </div>
                  <span className="sector-cambio negativo">
                    {sector.cambio_porcentual.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="report-footer">
        <p>
          Generado el{" "}
          {new Date(reporte.created_at).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default WeeklyReport;
