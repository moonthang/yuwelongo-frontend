import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { loginUser } from "../../../services/authService";
import Loader from "../../../components/ui/Loader/Loader";
import { Button } from "../../../components/ui/Button/Button";
import './LoginPage.css';

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { addToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginImage = "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Fse%C3%B1ora%20de%20la%20comunidad%20nasa.jpg?alt=media&token=2fa209cd-6baa-49b7-8823-4c16415b52d5";

  useEffect(() => {
    const img = new Image();
    img.src = loginImage;
    img.onload = () => setPageLoading(false);
    img.onerror = () => setPageLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await loginUser(correo, contrasena);
      login(data);
      addToast('success', `¡Bienvenido, ${data.nombre}!`);
      navigate("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      addToast('error', err.message || "Fallo la conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {pageLoading && (
        <div className="page-loader-container">
          <Loader />
        </div>
      )}
      <div className="login-page-container" style={{ visibility: pageLoading ? 'hidden' : 'visible' }}>
        <div className="login-form-section">
          <div className="login-container">
            <h2>Bienvenido</h2>
            <p className="login-subtitle">Por favor, introduzca sus datos.</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={cargando}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  type="password"
                  id="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={cargando}
                />
              </div>
              <Button type="submit" disabled={cargando} className="w-100">
                {cargando ? "Cargando..." : "Entrar"}
              </Button>
            </form>
            <p className="register-link">
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
          </div>
        </div>
        <div className="login-image-section">
          <img src={loginImage} alt="Mujer de la comunidad Nasa tejiendo" className="login-image" />
          <div className="image-overlay-text">
            <p>
              "Cada lengua indígena es un universo de conocimientos, historia y cosmovisión única; 
              al preservarlas, no solo salvaguardamos la identidad de un pueblo, sino que enriquecemos 
              la memoria y el patrimonio cultural de toda la humanidad."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}