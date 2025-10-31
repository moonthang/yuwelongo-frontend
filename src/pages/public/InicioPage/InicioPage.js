import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/ui/Loader/Loader";
import './InicioPage.css';

const carouselImages = [
  "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/carrusel%2Fnasa%20yuwe%201.jpeg?alt=media&token=d346ab96-f9a3-4d26-aeda-bef358d83f0a",
  "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/carrusel%2Fnasa%20yuwe%202.jpeg?alt=media&token=0cacf124-4d90-429d-ab84-6207bec42b83",
  "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/carrusel%2Fnasa%20yuwe%203.jpeg?alt=media&token=15323af0-a5cd-44e7-ae55-13ab50ed5baf"
];

const otherImages = [
  "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Faprender.png?alt=media&token=6363ba3d-7dba-450c-990b-741777590f39",
  "https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Fpreservar.png?alt=media&token=257b52a7-68bc-4a13-9a1c-e1e3331782e5"
];

const allImages = [...carouselImages, ...otherImages];

export default function InicioPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
  };

  useEffect(() => {
    let loadedImages = 0;
    const totalImages = allImages.length;

    if (totalImages === 0) {
      setLoading(false);
      return;
    }

    allImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          setLoading(false);
        }
      };
      img.onerror = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          setLoading(false);
        }
      };
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    resetTimer();
  };

  return (
    <div className="inicio-page-wrapper">
      {loading && (
        <div className="inicio-page-loader-container">
          <Loader />
        </div>
      )}
      <div className="inicio-page" style={{ visibility: loading ? 'hidden' : 'visible' }}>

      <section className="hero-section">
        <div className="carousel-container">
          {carouselImages.map((src, index) => (
            <img key={src} src={src} alt={`Carrusel ${index + 1}`} className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`} />
          ))}
        </div>
        <div className="hero-content">
          <h1>¡Bienvenido a YuweLongo!</h1>
          <p>Tu plataforma para aprender la lengua Nasa Yuwe y practicar. Sumérgete en nuestro diccionario.</p>
          <div className="cta-buttons">
            <Link to="/diccionario" className="btn btn-primary">Explora el Diccionario</Link>
          </div>
        </div>
        <div className="carousel-dots">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => goToImage(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h2>Lo que Ofrecemos</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-container">
              <div className="feature-icon-circle feature-icon-diccionario">
                <i className="bi bi-book"></i>
              </div>
            </div>
            <h3>Diccionario Completo</h3>
            <p>Encuentra palabras, significados, ejemplos y categorías fácilmente.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <div className="feature-icon-circle feature-icon-juego">
                <i className="bi bi-controller"></i>
              </div>
            </div>
            <h3>Juego Interactivo</h3>
            <p>Aprende de forma divertida con preguntas y niveles diseñados para ti.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-container">
              <div className="feature-icon-circle feature-icon-progreso">
                <i className="bi bi-graph-up"></i>
              </div>
            </div>
            <h3>Sigue tu Progreso</h3>
            <p>Guarda tus palabras favoritas y revisa tu historial de juego.</p>
          </div>
        </div>
      </section>
      
      <section className="info-section-row">
        <div className="info-text-block">
          <h2>Descubre el valor de aprender Nasa Yuwe</h2>
          <p>
            Aprender Nasa Yuwe es más que adquirir nuevas palabras: es una forma de conectar con una visión del mundo ancestral. Cada palabra refleja la relación del pueblo Nasa con la naturaleza, la comunidad y el territorio.
            Al aprender esta lengua, estás ayudando a mantener viva una parte esencial de la identidad cultural de Colombia y fortaleciendo el respeto por la diversidad lingüística.
          </p>
        </div>
        <div className="info-image-container">
          <img src="https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Faprender.png?alt=media&token=6363ba3d-7dba-450c-990b-741777590f39" alt="Ilustración sobre aprender Nasa Yuwe" />
        </div>
      </section>
      <section className="info-section-row reverse-order-desktop">
        <div className="info-text-block">
          <h2>Preservar las lenguas, proteger la memoria</h2>
          <p>
            Colombia alberga más de 60 lenguas indígenas, cada una con una historia única que cuenta cómo sus pueblos entienden el mundo. Preservarlas no solo es un acto de justicia cultural, sino también una forma de proteger saberes, tradiciones orales y conocimientos sobre la naturaleza que no existen en ningún otro idioma.
            Cuando una lengua desaparece, se pierde una forma de pensar y de ver la vida. Al apoyar la preservación de las lenguas indígenas, contribuyes a mantener viva la memoria colectiva de nuestros pueblos originarios.
          </p>
        </div>
        <div className="info-image-container">
          <img src="https://firebasestorage.googleapis.com/v0/b/yuwelongo.firebasestorage.app/o/img%2Fpreservar.png?alt=media&token=257b52a7-68bc-4a13-9a1c-e1e3331782e5" alt="Ilustración sobre preservar lenguas indígenas" />
        </div>
      </section>
      </div>
    </div>
  );
}