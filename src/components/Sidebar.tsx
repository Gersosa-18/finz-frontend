import React from "react";
import { Bell, Calendar, BarChart2, FileText, PieChart } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const pages = [
  { id: "alertas", label: "Alertas", icon: Bell },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "rsi", label: "📈 RSI", icon: BarChart2 },
  { id: "weekly-report", label: "Reporte Semanal", icon: FileText },
  { id: "mag7", label: "Mag 7 vs SPY", icon: PieChart },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Finz</h1>
      </div>
      <nav className="sidebar-nav">
        {pages.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${currentPage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
