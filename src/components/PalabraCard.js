import React, { useState, useRef, useEffect } from 'react';
import './PalabraCard.css';

const PalabraCard = ({ palabra, categorias = [], variant = 'public', onEdit, onDelete }) => {
    const {
        palabraNasa,
        traduccion,
        fraseEjemplo,
        imagenUrl,
        audioUrl,
        fecha_creacion,
        fecha_actualizacion,
    } = palabra;

    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const categoriaId = palabra.idCategoria || palabra.id_categoria;
    const categoria = categoriaId ? categorias.find(c => c.id === Number(categoriaId)) : null;
    const categoriaInfo = categoria ? categoria.nombre : (categoriaId || 'Sin categoría');
    const handlePlayAudio = (e) => {
        e.stopPropagation();
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current.play().catch(error => console.error("Error al reproducir audio:", error));
        setIsPlaying(!isPlaying); 
    };

    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, []);

    const renderFraseEjemplo = () => {
        if (!fraseEjemplo || !palabraNasa) {
            return fraseEjemplo;
        }
        const parts = fraseEjemplo.split(new RegExp(`(${palabraNasa})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === palabraNasa.toLowerCase() ? (
                        <strong key={index}>{part}</strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const displayDate = fecha_actualizacion || fecha_creacion;
    const formattedDate = displayDate ? new Date(displayDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return (
        <div className="palabra-card">
            <div className="palabra-card-image-container">
                <img src={imagenUrl || 'https://via.placeholder.com/400x200?text=Sin+Imagen'} alt={`Imagen de ${palabraNasa}`} className="palabra-card-image" />
                {audioUrl && (
                    <button onClick={handlePlayAudio} className="palabra-card-play-button" aria-label={`Reproducir audio de ${palabraNasa}`}>
                        <i className={`bi ${isPlaying ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'}`}></i>
                    </button>
                )}
            </div>
            <div className="palabra-card-content">
                <h3 className="palabra-card-title">{palabraNasa}</h3>
                <p className="palabra-card-translation">{traduccion}</p>
                {variant === 'admin' && <p className="palabra-card-category">Categoría: <strong>{categoriaInfo}</strong></p>}
                {fraseEjemplo && <p className="palabra-card-example"><em>{renderFraseEjemplo()}</em></p>}
                {variant === 'admin' && formattedDate && <p className="palabra-card-date">{formattedDate}</p>}
            </div>
            {variant === 'admin' && (onEdit || onDelete) && (
                <div className="card-footer bg-transparent border-top-0 p-2">
                    <div className="d-flex justify-content-end gap-3">
                        {onEdit && <button
                            className="btn btn-link text-warning p-0"
                            onClick={onEdit}
                            title="Editar"
                        >
                            <i className="bi bi-pencil-fill"></i>
                        </button>}
                        {onDelete && <button
                            className="btn btn-link text-danger p-0"
                            onClick={onDelete}
                            title="Eliminar"
                        >
                            <i className="bi bi-trash-fill"></i>
                        </button>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PalabraCard;