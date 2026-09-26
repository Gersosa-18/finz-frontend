import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import "./Navbar.css";

interface NavbarProps {
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    onLogout?.();
    navigate("/login");
  }, [navigate, onLogout]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand-badge">
          <span className="navbar-logo-icon">⚡</span>
          <span className="navbar-brand-name">Finz</span>
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-bell-container" title="Notificaciones activas">
          <Bell size={18} className="navbar-bell-icon" />
          <span className="bell-badge-dot" />
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
