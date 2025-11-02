import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Alertas from "./Dashboard/Alertas";
import Eventos from "./Dashboard/Eventos";
import { authAPI } from "../services/api";
import "./MainLayout.css";

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState("alertas");
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  return (
    <div className="main-layout">
      <Navbar onLogout={handleLogout} />
      <div className="layout-content">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="page-content">
          {currentPage === "alertas" && <Alertas />}
          {currentPage === "eventos" && <Eventos />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
