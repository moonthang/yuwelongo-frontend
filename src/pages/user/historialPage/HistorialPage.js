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
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const cargarHistorial = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await obtenerHistorialPorUsuario(user.idUsuario);
                setHistorial(data);
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
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return <div className="historial-loader"><Loader /></div>;
    }

    if (error) {
        return <div className="historial-container"><p className="historial-error">{error}</p></div>;
    }

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
                                {historial.map((partida) => (
                                    <tr key={partida.idJuego}>
                                        <td>{partida.nivel?.nombre || 'Nivel Desconocido'}</td>
                                        <td>{partida.puntaje}</td>
                                        <td>{formatearFecha(partida.fecha_juego)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}