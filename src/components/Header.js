import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">YuweLongo</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/diccionario">Diccionario</Link></li>
          <li><Link to="/juego">Juego</Link></li>

          {!user && (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Registro</Link></li>
            </>
          )}

          {user && (
            <>
              <li className="dropdown">
                <span className="user-name">{user.nombre} ▼</span>
                <ul className="dropdown-menu">
                  {user.rol === "ADMIN" && (
                    <>
                      <li><Link to="/admin/usuarios">Usuarios</Link></li>
                      <li><Link to="/admin/categorias">Categorías</Link></li>
                      <li><Link to="/admin/palabras">Palabras</Link></li>
                      <li><Link to="/admin/niveles">Niveles</Link></li>
                      <li><Link to="/admin/preguntas">Preguntas</Link></li>
                    </>
                  )}

                  {user.rol === "USUARIO" && (
                    <>
                      <li><Link to="/perfil">Perfil</Link></li>
                      <li><Link to="/favoritos">Favoritos</Link></li>
                      <li><Link to="/historial">Historial</Link></li>
                    </>
                  )}

                  <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
                </ul>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}