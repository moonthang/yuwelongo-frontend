import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerRankingGlobal, obtenerMejoresPuntajesPorNivel } from '../../../services/juegoResultadoService';
import Loader from '../../../components/ui/Loader/Loader';
import { obtenerUsuarioPorId } from '../../../services/userService';
import { obtenerNiveles } from '../../../services/nivelService';
import './RankingPage.css';

export default function RankingPage() {
    const [vistaActual, setVistaActual] = useState('global');
    const navigate = useNavigate();
    const [rankingGlobal, setRankingGlobal] = useState([]);
    const [mejoresPorNivel, setMejoresPorNivel] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageGlobal, setPageGlobal] = useState(1);
    const [pageNiveles, setPageNiveles] = useState(1);
    const PAGE_SIZE = 10;
    const NIVELES_PER_PAGE = 5;

    useEffect(() => {
        const fetchAndEnrichRankingData = async (fetchFunction, ...args) => {
            const rankingData = await fetchFunction(...args);
            if (!rankingData || rankingData.length === 0) return [];

            const normalized = rankingData.map(r => {
                if (Array.isArray(r)) {
                    return {
                        idUsuario: r[0],
                        nombreUsuario: r[1],
                        puntaje: r[2]
                    };
                }
                return {
                    idUsuario: r.idUsuario || r.id_usuario || r.usuario?.idUsuario || null,
                    nombreUsuario: r.nombreUsuario || r.nombre || r.usuario?.nombre || 'Usuario Anónimo',
                    puntaje: r.puntaje || r.puntajeTotal || r.puntaje_total || 0
                };
            });

            const enriched = await Promise.all(normalized.map(async (item) => {
                if ((!item.nombreUsuario || item.nombreUsuario === 'Usuario Anónimo') && item.idUsuario) {
                    try {
                        const user = await obtenerUsuarioPorId(item.idUsuario);
                        return { ...item, nombreUsuario: user?.nombre || 'Usuario Anónimo' };
                    } catch {
                        return item;
                    }
                }
                return item;
            }));

            return enriched;
        };

        const cargarRankings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const globalData = await fetchAndEnrichRankingData(obtenerRankingGlobal, 100);
                setRankingGlobal(globalData);
                setPageGlobal(1);
                const nivelesData = await obtenerNiveles();
                const nivelesOrdenados = Array.isArray(nivelesData) ? nivelesData.sort((a, b) => (a.orden || 0) - (b.orden || 0)) : [];
                const mejoresPromises = nivelesOrdenados.map(async (nivel) => {
                    const top = await fetchAndEnrichRankingData(obtenerMejoresPuntajesPorNivel, nivel.idNivel, 3);
                    return { nivel, top };
                });
                const mejores = await Promise.all(mejoresPromises);
                setMejoresPorNivel(mejores);
            } catch {
                setError('No se pudo cargar la información del ranking. Inténtalo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        cargarRankings();
    }, []);

    const renderTablaRanking = (datos, tipo) => {
        if (isLoading) return <div className="ranking-loader"><Loader /></div>;
        if (error) return <p className="ranking-error">{error}</p>;
        if (datos.length === 0) return <p className="ranking-empty">Aún no hay puntajes para mostrar en este ranking.</p>;

        if (tipo === 'global') {
            const totalPages = Math.max(1, Math.ceil(datos.length / PAGE_SIZE));
            const start = (pageGlobal - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const pageData = datos.slice(start, end);

            return (
                <>
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Usuario</th>
                                <th>Puntaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((item, index) => (
                                <tr key={`${tipo}-${item.idUsuario || item.id_usuario || item.idJuego || start + index}`}>
                                    <td><span className={`ranking-position pos-${start + index + 1}`}>{start + index + 1}</span></td>
                                    <td>{item.nombreUsuario || item.usuario?.nombre || item.nombre || item.nombre_usuario || 'Usuario Anónimo'}</td>
                                    <td>{item.puntaje || item.puntajeTotal || item.puntaje_total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="ranking-pagination mt-3 d-flex justify-content-center align-items-center">
                        <button className="btn btn-sm btn-pagination me-2" onClick={() => setPageGlobal(p => Math.max(1, p - 1))} disabled={pageGlobal <= 1}>Anterior</button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} className={`btn btn-sm ${pageGlobal === i + 1 ? 'btn-pagination' : 'btn-outline-secondary'} me-1`} onClick={() => setPageGlobal(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="btn btn-sm btn-pagination ms-2" onClick={() => setPageGlobal(p => Math.min(totalPages, p + 1))} disabled={pageGlobal >= totalPages}>Siguiente</button>
                    </div>
                </>
            );
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
                        <tr key={`${tipo}-${item.idUsuario || item.id_usuario || item.idJuego || index}`}>
                            <td><span className={`ranking-position pos-${index + 1}`}>{index + 1}</span></td>
                            <td>{item.nombreUsuario || item.usuario?.nombre || item.nombre || item.nombre_usuario || 'Usuario Anónimo'}</td>
                            <td>{item.puntaje || item.puntajeTotal || item.puntaje_total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderMejoresPorNivel = () => {
        if (isLoading) return <div className="ranking-loader"><Loader /></div>;
        if (error) return <p className="ranking-error">{error}</p>;
        if (!mejoresPorNivel || mejoresPorNivel.length === 0) return <p className="ranking-empty">Aún no hay niveles para mostrar.</p>;

        const totalPages = Math.ceil(mejoresPorNivel.length / NIVELES_PER_PAGE);
        const startIndex = (pageNiveles - 1) * NIVELES_PER_PAGE;
        const pageData = mejoresPorNivel.slice(startIndex, startIndex + NIVELES_PER_PAGE);

        return (
            <div className="mejores-por-nivel">
                {pageData.map(({ nivel, top }) => (
                    <div key={nivel.idNivel} className="nivel-block mb-4">
                        <h3 className="nivel-title">{nivel.nombre}</h3>
                        {top && top.length > 0 ? (
                            <table className="ranking-table small">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Usuario</th>
                                        <th>Puntaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top.map((item, idx) => (
                                        <tr key={`${nivel.idNivel}-${idx}`}>
                                            <td><span className={`ranking-position pos-${idx + 1}`}>{idx + 1}</span></td>
                                            <td>{item.nombreUsuario || item.usuario?.nombre || item.nombre || item.nombre_usuario || 'Usuario Anónimo'}</td>
                                            <td>{item.puntaje || item.puntajeTotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="ranking-empty">Aún no hay puntajes para este nivel.</p>
                        )}
                    </div>
                ))}

                <div className="ranking-pagination mt-3 d-flex justify-content-center align-items-center">
                    <button className="btn btn-sm btn-pagination me-2" onClick={() => setPageNiveles(p => Math.max(1, p - 1))} disabled={pageNiveles <= 1}>Anterior</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} className={`btn btn-sm ${pageNiveles === i + 1 ? 'btn-pagination' : 'btn-outline-secondary'} me-1`} onClick={() => setPageNiveles(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="btn btn-sm btn-pagination ms-2" onClick={() => setPageNiveles(p => Math.min(totalPages, p + 1))} disabled={pageNiveles >= totalPages}>Siguiente</button>
                </div>
            </div>
        );
    };

    return (
        <div className="ranking-page bg-light">
            <div className="ranking-container">
                <div className="ranking-header">
                    <button onClick={() => navigate('/juego-preview')} className="btn-retroceder">
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="ranking-title">Tabla de Clasificación</h1>
                </div>
                <p className="ranking-subtitle">Compite y demuestra tus conocimientos en Nasa Yuwe.</p>

                <div className="ranking-selector">
                    <button className={`selector-btn ${vistaActual === 'global' ? 'active' : ''}`} onClick={() => setVistaActual('global')}>
                        <i className="bi bi-globe"></i> Ranking Global
                    </button>
                    <button className={`selector-btn ${vistaActual === 'nivel' ? 'active' : ''}`} onClick={() => setVistaActual('nivel')}>
                        <i className="bi bi-diagram-2-fill"></i> Mejores Puntajes por Nivel
                    </button>
                </div>

                <div className="ranking-content">
                    {vistaActual === 'global' ? renderTablaRanking(rankingGlobal, 'global') : renderMejoresPorNivel()}
                </div>
            </div>
        </div>
    );
}