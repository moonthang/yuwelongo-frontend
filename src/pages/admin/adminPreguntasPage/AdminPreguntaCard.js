import React from 'react';

const AdminPreguntaCard = ({ pregunta, onEdit, onDelete, loading }) => {
    const {
        idPregunta,
        preguntaTexto,
        opcion1,
        opcion2,
        opcion3,
        opcion4,
        respuestaCoreccta,
        xpValor,
        nivel,
        palabra
    } = pregunta;

    const getOpcionClass = (opcion) => {
        return opcion === respuestaCoreccta ? 'list-group-item list-group-item-success' : 'list-group-item';
    };

    return (
        <div className="col">
            <div className="card shadow-sm h-100">
                <div className="card-header">
                    <h5 className="card-title mb-0">{preguntaTexto}</h5>
                </div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        <li className={getOpcionClass(opcion1)}>{opcion1}</li>
                        <li className={getOpcionClass(opcion2)}>{opcion2}</li>
                        <li className={getOpcionClass(opcion3)}>{opcion3}</li>
                        <li className={getOpcionClass(opcion4)}>{opcion4}</li>
                    </ul>
                    <p className="card-text mt-3"><small className="text-muted">Nivel: {nivel?.nombre || 'N/A'} | XP: {xpValor} | Palabra: {palabra?.palabraNasa || 'N/A'}</small></p>
                </div>
                <div className="card-footer bg-transparent border-top-0 pb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">ID: {idPregunta}</small>
                        <div className="d-flex justify-content-end gap-3">
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