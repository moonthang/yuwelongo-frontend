import React from 'react';
import './AdminCategoriaCard.css';

const AdminCategoriaCard = ({ category, onEdit, onDelete, loading }) => {
    const placeholderImage = 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';

    return (
        <div className="col admin-category-card-enter mb-3">
            <div className="card shadow-sm overflow-hidden d-flex flex-column">
                <div className="row g-0 h-100">
                    <div className="col-md-5">
                        <img
                            src={category.imagenUrl || placeholderImage} 
                            className="img-fluid rounded-start" 
                            alt={`Imagen de ${category.nombre}`}
                            style={{ objectFit: 'cover', width: '100%', height: '150px' }}
                        />
                    </div>
                    <div className="col-md-7 d-flex flex-column">
                        <div className="card-body d-flex flex-column p-2 overflow-hidden">
                            <h5 className="card-title mb-1 fs-6">{category.nombre}</h5>
                            <p className="card-text text-muted flex-grow-1 small mb-1">{category.descripcion}</p>
                            <p className="card-text mt-auto pt-1 mb-0">
                                <small className="text-body-secondary">ID: {category.id}</small>
                            </p>
                        </div>
                        <div className="card-footer bg-transparent border-top-0 pt-0 pb-1">
                            <div className="d-flex justify-content-end gap-3">
                                <button
                                    className="btn btn-link text-warning p-0"
                                    onClick={() => onEdit(category)}
                                    disabled={loading}
                                    title="Editar"
                                >
                                    <i className="bi bi-pencil-fill"></i>
                                </button>
                                <button
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => onDelete(category)}
                                    disabled={loading}
                                    title="Eliminar"
                                >
                                    <i className="bi bi-trash-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategoriaCard;