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
      <div className="navbar-brand">
        <h1>Finz</h1>
      </div>
      <button className="btn-logout" onClick={handleLogout}>
        Salir
      </button>
    </nav>
  );
};

export default Navbar;
