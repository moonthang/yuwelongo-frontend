import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './JuegoPreviewPage.css';
import Loader from '../../../components/ui/Loader/Loader';

export default function JuegoPreviewPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="juego-preview-page-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="juego-preview-page bg-light">
      <div className="juego-preview-container">
        <h1 className="juego-preview-title">Desafío de palabras</h1>
        <p className="juego-preview-subtitle">
          ¡Adivina las palabras y amplía tu vocabulario!
        </p>
        <div className="juego-preview-info-tags">
          <div className="juego-preview-info-tag">
            <i className="bi bi-book-half"></i>
            <span>Vocabulario</span>
          </div>
          <div className="juego-preview-info-tag">
            <i className="bi bi-spellcheck"></i>
            <span>Ortografía</span>
          </div>
          <div className="juego-preview-info-tag">
            <i className="bi bi-clock"></i>
            <span>5-10 min</span>
          </div>
          <div className="juego-ranking-tag">
            <Link to="/ranking" className="juego-ranking-content">
              <i className="bi bi-stars"></i>
              <span>Ver Ranking</span>
            </Link>
          </div>
        </div>
        <section className="juego-preview-section">
          <h3>Objetivo del Juego</h3>
          <p>
            El objetivo es adivinar la palabra en Nasa Yuwe a partir de una imagen y una frase incompleta de pista. ¡Acumula puntos y demuestra cuánto sabes!
          </p>
        </section>
        <section className="juego-preview-section">
          <h3>¿Cómo Jugar?</h3>
          <ul>
            <li>Se te presentará una imagen y una frase incompleta.</li>
            <li>Elije la palabra correcta en Nasa Yuwe entre las 4 opciones.</li>
            <li>Si aciertas, sumarás puntos y pasarás a la siguiente palabra.</li>
            <li>Si fallas, ¡no te preocupes! Tendrás más oportunidades para aprender.</li>
          </ul>
        </section>
        <Link to="/juego" className="juego-preview-play-button">
          Jugar
        </Link>
      </div>
    </div>
  );
}