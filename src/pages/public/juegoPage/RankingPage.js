import React, { useState, useEffect } from 'react';
import { obtenerRankingGlobal, obtenerMejoresPuntajesPorNivel } from '../../../services/juegoResultadoService';
import Loader from '../../../components/ui/Loader/Loader';
import './RankingPage.css';

const ID_NIVEL_JUEGO = 1;

export default function RankingPage() {
    const [vistaActual, setVistaActual] = useState('global');
    const [rankingGlobal, setRankingGlobal] = useState([]);
    const [rankingNivel, setRankingNivel] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarRankings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [globalData, nivelData] = await Promise.all([
                    obtenerRankingGlobal(10),
                    obtenerMejoresPuntajesPorNivel(ID_NIVEL_JUEGO, 10)
                ]);
                setRankingGlobal(globalData);
                setRankingNivel(nivelData);
            } catch (err) {
                setError('No se pudo cargar la información del ranking. Inténtalo más tarde.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        cargarRankings();
    }, []);

    const renderTablaRanking = (datos, tipo) => {
        if (isLoading) {
            return <div className="ranking-loader"><Loader /></div>;
        }
        if (error) {
            return <p className="ranking-error">{error}</p>;
        }
        if (datos.length === 0) {
            return <p className="ranking-empty">Aún no hay puntajes para mostrar en este ranking.</p>;
        }

        return (
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th>Puntaje</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map((item, index) => (
                        <tr key={`${tipo}-${item.idUsuario || index}`}>
                            <td>
                                <span className={`ranking-position pos-${index + 1}`}>{index + 1}</span>
                            </td>
                            <td>{item.nombreUsuario || 'Usuario Anónimo'}</td>
                            <td>{item.puntaje || item.puntajeTotal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="ranking-page bg-light">
            <div className="ranking-container">
                <h1 className="ranking-title">Tabla de Clasificación</h1>
                <p className="ranking-subtitle">
                    Compite y demuestra tus conocimientos en Nasa Yuwe.
                </p>

                <div className="ranking-selector">
                    <button
                        className={`selector-btn ${vistaActual === 'global' ? 'active' : ''}`}
                        onClick={() => setVistaActual('global')}
                    >
                        <i className="bi bi-globe"></i> Ranking Global
                    </button>
                    <button
                        className={`selector-btn ${vistaActual === 'nivel' ? 'active' : ''}`}
                        onClick={() => setVistaActual('nivel')}
                    >
                        <i className="bi bi-diagram-2-fill"></i> Mejores Puntajes por Nivel
                    </button>
                </div>

                <div className="ranking-content">
                    {vistaActual === 'global'
                        ? renderTablaRanking(rankingGlobal, 'global')
                        : renderTablaRanking(rankingNivel, 'nivel')}
                </div>
            </div>
        </div>
    );
}