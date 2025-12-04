import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const pages = [
    { id: "alertas", label: "📊 Alertas" },
    { id: "eventos", label: "📅 Eventos" },
    { id: "rsi", label: "📈 RSI" },
    { id: "weekly-report", label: "📈 Reporte Semanal" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`nav-item ${currentPage === page.id ? "active" : ""}`}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
