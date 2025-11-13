import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TickerTape from "../components/TickerTape";
import Alertas from "./Dashboard/Alertas";
import Eventos from "./Dashboard/Eventos";
import RSI from "./Dashboard/RSI";
import { authAPI } from "../services/api";
import "./MainLayout.css";

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("alertas");
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    onLogout();
    navigate("/login");
  };

  return (
    <div className="main-layout">
      <Navbar onLogout={handleLogout} />
      <TickerTape />
      <div className="layout-content">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="page-content">
          {currentPage === "alertas" && <Alertas />}
          {currentPage === "eventos" && <Eventos />}
          {currentPage === "rsi" && <RSI />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
