import React from "react";
import {
  Bell,
  Calendar,
  BarChart2,
  FileText,
  TrendingUp,
  Brain,
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const pages = [
  { id: "mag7", label: "Mercados", icon: TrendingUp },
  { id: "rsi", label: "RSI", icon: BarChart2 },
  { id: "alertas", label: "Alertas", icon: Bell },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "weekly-report", label: "Reporte", icon: FileText },
  { id: "analisis", label: "Análisis IA", icon: Brain },
];

const Sidebar: React.FC<SidebarProps> = React.memo(({ currentPage, onNavigate }) => {
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
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
