import React from 'react';

const AdminNivelCard = ({ nivel, onEdit, onDelete, loading }) => {
    const getEstadoClass = (estado) => {
        switch (estado) {
            case 'activo':
                return 'badge bg-success';
            case 'inactivo':
                return 'badge bg-secondary';
            case 'proximamente':
                return 'badge bg-info';
            default:
                return 'badge bg-light text-dark';
        }
    };

    return (
        <div className="col">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{nivel.nombre} (Orden: {nivel.orden})</h5>
                    <p className="card-text flex-grow-1">{nivel.descripcion}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <p className="card-text mb-0">
                            <small className="text-body-secondary">ID: {nivel.idNivel}</small>
                        </p>
                        <span className={getEstadoClass(nivel.estado)}>{nivel.estado}</span>
                    </div>
                </div>
                <div className="card-footer bg-transparent border-top-0 pb-2">
                    <div className="d-flex justify-content-end gap-3">
                        <button className="btn btn-link text-warning p-0" onClick={() => onEdit(nivel)} disabled={loading} title="Editar"><i className="bi bi-pencil-fill"></i></button>
                        <button className="btn btn-link text-danger p-0" onClick={() => onDelete(nivel)} disabled={loading} title="Eliminar"><i className="bi bi-trash-fill"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNivelCard;