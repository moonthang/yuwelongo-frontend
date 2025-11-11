import React from 'react';

const AdminPreguntaCard = ({ pregunta, onEdit, onDelete, onPreview, loading }) => {
    const {
        idPregunta,
        xpValor,
        nivel,
        palabra
    } = pregunta;

    return (
        <div className="col">
            <div className="card shadow-sm">
                <div className="card-body p-3">
                    <p className="card-text mb-1"><small className="text-muted">ID: {idPregunta}</small></p>
                    <p className="card-text mb-1"><small>Nivel: {nivel?.nombre || 'N/A'}</small></p>
                    <p className="card-text mb-1"><small>XP: {xpValor}</small></p>
                    <p className="card-text mb-0"><small>Palabra: {palabra?.palabraNasa || 'N/A'}</small></p>
                </div>
                <div className="card-footer bg-transparent border-top-0 pb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div></div>
                        <div className="d-flex justify-content-end gap-3">
                            <button
                                className="btn btn-link text-primary p-0"
                                onClick={() => onPreview(pregunta)}
                                disabled={loading}
                                title="Ver diseño de tarjeta"
                            >
                                <i className="bi bi-eye-fill"></i>
                            </button>
                            <button
                                className="btn btn-link text-warning p-0"
                                onClick={() => onEdit(pregunta)}
                                disabled={loading}
                                title="Editar"
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => onDelete(pregunta)}
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
    );
};

export default AdminPreguntaCard;