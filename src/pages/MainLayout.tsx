import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TickerTape from "../components/TickerTape";
import Alertas from "./Dashboard/Alertas";
import Eventos from "./Dashboard/Eventos";
import RSI from "./Dashboard/RSI";
import WeeklyReport from "./Dashboard/WeeklyReport";
import Mag7 from "./Dashboard/Mag7";
import Analisis from "./Dashboard/Analisis";
import { authAPI } from "../services/api";
import "./MainLayout.css";

interface MainLayoutProps {
  onLogout: () => void;
}

export type DashboardPage =
  | "alertas"
  | "eventos"
  | "rsi"
  | "weekly-report"
  | "mag7"
  | "analisis";

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>("alertas");
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    authAPI.logout();
    onLogout();
    navigate("/login");
  }, [navigate, onLogout]);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as DashboardPage);
  }, []);

  return (
    <div className="main-layout">
      <Navbar onLogout={handleLogout} />
      <TickerTape />
      <div className="layout-content">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="page-content">
          {currentPage === "alertas" && <Alertas />}
          {currentPage === "eventos" && <Eventos />}
          {currentPage === "rsi" && <RSI />}
          {currentPage === "weekly-report" && <WeeklyReport />}
          {currentPage === "mag7" && <Mag7 />}
          {currentPage === "analisis" && <Analisis />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
