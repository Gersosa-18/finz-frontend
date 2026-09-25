import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="navbar-page-title">Dashboard</div>
      <div className="navbar-right">
        <button className="btn-logout" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
