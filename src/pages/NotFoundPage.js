import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3">
          <span className="text-danger">¡Ups!</span> Página no encontrada.
        </p>
        <p className="lead">
          La página que estás buscando no existe o fue movida.
        </p>
        <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;