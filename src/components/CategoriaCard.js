import React from 'react';
import { Link } from 'react-router-dom';
import './CategoriaCard.css';

const CategoriaCard = ({ categoria }) => {
    if (!categoria) {
        return null;
    }

    return (
        <Link to={`/diccionario/categoria/${categoria.idCategoria}`} className="categoria-card-link">
            <div className="categoria-card" style={{ backgroundImage: `url(${categoria.imagenUrl})` }}>
                <div className="categoria-card-title-overlay">
                    <h3 className="categoria-card-title">{categoria.nombre}</h3>
                </div>
            </div>
        </Link>
    );
};

export default CategoriaCard;