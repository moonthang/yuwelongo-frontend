import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { crearUsuario } from "../../../services/userService";
import Loader from "../../../components/ui/Loader/Loader";
import { Button } from "../../../components/ui/Button/Button";
import './RegisterPage.css';

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const registerImage = "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Fa38-4.png?alt=media&token=34137846-3866-43ef-a8c7-f7361c16f065";

  useEffect(() => {
    const img = new Image();
    img.src = registerImage;
    img.onload = () => setPageLoading(false);
    img.onerror = () => setPageLoading(false);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await crearUsuario({ nombre, correo, contrasena, rol: "USUARIO" });
      addToast('success', '¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate("/login");
    } catch (err) {
      console.error("Error al registrar:", err);
      addToast('error', err.message || "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      {pageLoading && (
        <div className="page-loader-container">
          <Loader />
        </div>
      )}
      <div className="register-page-container" style={{ visibility: pageLoading ? 'hidden' : 'visible' }}>
        <div className="register-form-section">
          <div className="register-container">
            <h2>Crea tu Cuenta</h2>
            <p className="register-subtitle">Únete a nuestra comunidad y conoce un nuevo mundo.</p>
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  required
                  disabled={cargando}
                />
              </div>
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
                  placeholder="Crea una contraseña segura"
                  required
                  disabled={cargando}
                />
              </div>
              <Button type="submit" disabled={cargando} className="w-100">
                {cargando ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </form>
            <p className="login-link">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
        <div className="register-image-section">
          <img src={registerImage} alt="Mujer de la comunidad Nasa tejiendo" className="register-image" />
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