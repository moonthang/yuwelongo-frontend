import React from "react";
import { Link } from "react-router-dom";

export default function InicioPage() {
  return (
    <div className="inicio-page">
      <section className="hero-section">
        <h1>¡Bienvenido a YuweLongo! 👋</h1>
        <p>Tu plataforma para aprender Nasa Yuwe y practicar. Sumérgete en nuestro diccionario y pon a prueba tus conocimientos con nuestro juego interactivos.</p>
        <div className="cta-buttons">
          <Link to="/diccionario" className="btn btn-primary">Explora el Diccionario</Link>
          <Link to="/juego" className="btn btn-secondary">Comienza a Jugar</Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Lo que Ofrecemos</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Diccionario Completo</h3>
            <p>Encuentra palabras, significados, ejemplos y categorías fácilmente.</p>
          </div>
          <div className="feature-card">
            <h3>Juego Interactivo</h3>
            <p>Aprende de forma divertida con preguntas y niveles diseñados para ti.</p>
          </div>
          <div className="feature-card">
            <h3>Sigue tu Progreso</h3>
            <p>Guarda tus palabras favoritas y revisa tu historial de juego.</p>
          </div>
        </div>
      </section>
      
      {}

    </div>
  );
}