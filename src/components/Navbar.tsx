import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

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
};

export default Navbar;
