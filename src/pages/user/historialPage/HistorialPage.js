import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerHistorialPorUsuario } from '../../../services/juegoResultadoService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader/Loader';
import './HistorialPage.css';

export default function HistorialPage() {
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const cargarHistorial = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await obtenerHistorialPorUsuario(user.idUsuario);
                console.log('Historial recibido:', data);
                setHistorial(data);
                setCurrentPage(1);
            } catch (err) {
                setError('No se pudo cargar tu historial de partidas. Inténtalo más tarde.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        cargarHistorial();
    }, [user]);

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Fecha no disponible';
        let fechaString = fechaISO;
        if (typeof fechaString === 'string' && fechaString.includes(' ') && !fechaString.includes('T')) {
            fechaString = fechaString.replace(' ', 'T');
        }
        
        const fecha = new Date(fechaString);
        
        if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida:', fechaISO);
            return 'Fecha no disponible';
        }
        
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const obtenerFecha = (partida) => {
        const fechaValue = partida.fecha_juego || partida.fechaJuego || partida.fecha || partida.date || partida.createdAt;
        return formatearFecha(fechaValue);
    };

    if (isLoading) {
        return <div className="historial-loader"><Loader /></div>;
    }

    if (error) {
        return <div className="historial-container"><p className="historial-error">{error}</p></div>;
    }

    const totalPages = Math.max(1, Math.ceil(historial.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const currentHistorialPage = historial.slice(startIndex, endIndex);
    return (
        <div className="historial-page bg-light">
            <div className="historial-container">
                <h1 className="historial-title">Mi Historial de Partidas</h1>
                <p className="historial-subtitle">
                    Aquí puedes ver los resultados de todas tus partidas jugadas.
                </p>

                <div className="historial-content">
                    {historial.length === 0 ? (
                        <div className="historial-empty text-center">
                            <p>Aún no has jugado ninguna partida.</p>
                            <Link to="/juego-preview" className="juego-preview-play-button btn btn-primary mt-3">¡Jugar ahora!</Link>
                        </div>
                    ) : (
                        <table className="historial-table">
                            <thead>
                                <tr>
                                    <th>Nivel</th>
                                    <th>Puntaje</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentHistorialPage.map((partida) => (
                                    <tr key={partida.idJuego}>
                                        <td>{partida.nivel?.nombre || 'Nivel Desconocido'}</td>
                                        <td>{partida.puntaje}</td>
                                        <td>{obtenerFecha(partida)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {historial.length > PAGE_SIZE && (
                        <div className="historial-pagination mt-3 d-flex justify-content-center align-items-center">
                            <button className="btn btn-sm btn-pagination me-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-pagination active' : 'btn-outline-secondary'} me-1`} onClick={() => setCurrentPage(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button className="btn btn-sm btn-pagination ms-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}