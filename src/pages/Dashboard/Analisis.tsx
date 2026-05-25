import React, { useState, useRef } from "react";
import { analisisAPI } from "../../services/api";
import { AnalisisResponse } from "../../types/analisis";
import "./Analisis.css";
import ReactMarkDown from "react-markdown";

const VEREDICTO_EMOJI: Record<string, string> = {
  COMPRAR: "🟢",
  ESPERAR: "🟡",
  NO_ENTRAR: "🔴",
};

const Analisis = () => {
  const [ticker, setTicker] = useState("");
  const [timeframe, setTimeframe] = useState("semanal");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AnalisisResponse | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [observacion, setObservacion] = useState("");

  const handleFile = (file: File) => {
    setImagen(file);
    setPreview(URL.createObjectURL(file));
    setResultado(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalizar = async () => {
    if (!ticker.trim() || !imagen) {
      setError("Completá el ticker y subí un chart.");
      return;
    }
    setLoading(true);
    setError("");
    setResultado(null);
    try {
      const res = await analisisAPI.analizar(
        ticker.trim(),
        timeframe,
        imagen,
        observacion,
      );
      setResultado(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Error al analizar. Intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="analisis-page">
      <h2>🤖 Análisis Multi-Agente</h2>

      <div className="analisis-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Ticker (ej: NFLX, AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            disabled={loading}
          />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={loading}
          >
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
          <textarea
            placeholder="Observación opcional (ej: 'noto que rompió soporte esta semana')"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            disabled={loading}
            rows={2}
          />
        </div>

        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""} ${imagen ? "has-file" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          {imagen ? (
            <>
              <span>✓ {imagen.name}</span>
              {preview && (
                <img src={preview} alt="preview" className="img-preview" />
              )}
            </>
          ) : (
            <span>📊 Arrastrá el chart acá o hacé click para subir</span>
          )}
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <button
          className="btn-analizar"
          onClick={handleAnalizar}
          disabled={loading || !imagen || !ticker}
        >
          {loading ? "Analizando..." : "Analizar"}
        </button>
      </div>

      {loading && (
        <div className="analisis-loading">
          <div className="spinner" />
          <span>Los tres agentes están analizando...</span>
        </div>
      )}

      {resultado && (
        <>
          <div className={`veredicto-banner ${resultado.veredicto}`}>
            <span>{VEREDICTO_EMOJI[resultado.veredicto]}</span>
            <span>
              {resultado.ticker} — {resultado.veredicto}
            </span>
            <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>
              ({resultado.timeframe})
            </span>
          </div>

          <div className="agentes-grid">
            <div className="agente-card">
              <div className="agente-label">📈 Agente Técnico</div>
              <div className="agente-texto">
                <ReactMarkDown>{resultado.agente_tecnico}</ReactMarkDown>
              </div>
            </div>

            <div className="agente-card">
              <div className="agente-label">📊 Agente Fundamental</div>
              <div className="agente-texto">
                <ReactMarkDown>{resultado.agente_fundamental}</ReactMarkDown>
              </div>
            </div>

            <div className="agente-card moderador">
              <div className="agente-label">⚖️ Moderador</div>
              <div className="agente-texto">
                <ReactMarkDown>{resultado.moderador}</ReactMarkDown>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Analisis;
