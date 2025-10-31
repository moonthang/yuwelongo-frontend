import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
            <img src="/logo192.png" alt="YuweLongo Logo" className="header-logo me-2" />
            Yuwelongo
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link className="nav-link btn btn-primary btn-diccionario me-2" to="/diccionario"><i className="bi bi-book me-1"></i>Diccionario</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-primary btn-juego me-2" to="/juego"><i className="bi bi-controller me-1"></i>Juego</Link>
              </li>
            </ul>
            <ul className="navbar-nav">
              {!user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link btn btn-outline-primary me-2" to="/login"><i className="bi bi-box-arrow-in-right me-1"></i>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link btn btn-primary" to="/register"><i className="bi bi-person-plus me-1"></i>Registro</Link>
                  </li>
                </>
              )}

              {user && (
                <li className="nav-item dropdown">
                  <button className="nav-link dropdown-toggle" id="navbarDropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="me-1"></i>{user.nombre}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    {user.rol === "ADMIN" && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/usuarios"><i className="bi bi-people me-1"></i>Usuarios</Link></li>
                        <li><Link className="dropdown-item" to="/admin/categorias"><i className="bi bi-tags me-1"></i>Categorías</Link></li>
                        <li><Link className="dropdown-item" to="/admin/palabras"><i className="bi bi-card-text me-1"></i>Palabras</Link></li>
                        <li><Link className="dropdown-item" to="/admin/niveles"><i className="bi bi-graph-up me-1"></i>Niveles</Link></li>
                        <li><Link className="dropdown-item" to="/admin/preguntas"><i className="bi bi-question-circle me-1"></i>Preguntas</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {user.rol === "USUARIO" && (
                      <>
                        <li><Link className="dropdown-item" to="/perfil"><i className="bi bi-person me-1"></i>Perfil</Link></li>
                        <li><Link className="dropdown-item" to="/favoritos"><i className="bi bi-heart me-1"></i>Favoritos</Link></li>
                        <li><Link className="dropdown-item" to="/historial"><i className="bi bi-clock-history me-1"></i>Historial</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión</button></li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}