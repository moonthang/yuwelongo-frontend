import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPreguntasPorNivel } from '../../../services/preguntaService';
import { obtenerNivelPorId } from '../../../services/nivelService';
import { useAuth } from '../../../context/AuthContext';
import { guardarResultado } from '../../../services/juegoResultadoService';
import Loader from '../../../components/ui/Loader/Loader';
import './JuegoPage.css';

const ID_NIVEL_JUEGO = 1;
const CANTIDAD_PREGUNTAS = 10;

export default function JuegoPage() {
    const [estadoJuego, setEstadoJuego] = useState('cargando');
    const [preguntas, setPreguntas] = useState([]);
    const [nivel, setNivel] = useState(null);
    const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
    const [puntaje, setPuntaje] = useState(0);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        const cargarPreguntas = async () => {
            setEstadoJuego('cargando');
            try {
                const [data, nivelData] = await Promise.all([
                    obtenerPreguntasPorNivel(ID_NIVEL_JUEGO, { aleatorias: true, cantidad: CANTIDAD_PREGUNTAS }),
                    obtenerNivelPorId(ID_NIVEL_JUEGO)
                ]);

                if (data && data.length > 0) {
                    const preguntasConOpcionesMezcladas = data.map(p => {
                        const opciones = [p.opcion1, p.opcion2, p.opcion3, p.opcion4].sort(() => Math.random() - 0.5);
                        return { ...p, opciones };
                    });
                    setPreguntas(preguntasConOpcionesMezcladas);
                    setNivel(nivelData);
                    setEstadoJuego('jugando');
                } else {
                    setError('No se encontraron preguntas para este nivel. Inténtalo más tarde.');
                    setEstadoJuego('error');
                }
            } catch (err) {
                setError('Hubo un problema al cargar el juego. Por favor, vuelve a intentarlo.');
                setEstadoJuego('error');
            }
        };

        cargarPreguntas();
    }, []);

    const handleSeleccionarOpcion = (opcion) => {
        if (feedback) return;
        setOpcionSeleccionada(opcion);
    };

    const handleComprobarRespuesta = () => {
        if (!opcionSeleccionada) return;

        const preguntaActual = preguntas[preguntaActualIndex];
        if (opcionSeleccionada.trim().toLowerCase() === preguntaActual.respuestaCoreccta.trim().toLowerCase()) {
            setFeedback('correcta');
            setPuntaje(puntaje + (preguntaActual.xpValor || 0));
        } else {
            setFeedback('incorrecta');
        }
    };

    const handleSiguientePregunta = async () => {
        setFeedback('');
        setOpcionSeleccionada(null);

        if (preguntaActualIndex < preguntas.length - 1) {
            setPreguntaActualIndex(preguntaActualIndex + 1);
        } else {
            if (user) {
                try {
                    await guardarResultado({
                        puntaje,
                        idUsuario: user.id,
                        idNivel: ID_NIVEL_JUEGO
                    });
                } catch (saveError) {
                    console.error("Error al guardar el resultado:", saveError);
                }
            }
            setEstadoJuego('finalizado');
        }
    };

    if (estadoJuego === 'cargando') {
        return <div className="juego-page-loading"><Loader /></div>;
    }

    if (estadoJuego === 'error') {
        return (
            <div className="juego-page bg-light">
                <div className="juego-page-container text-center">
                    <h2 className="text-danger">¡Oh no!</h2>
                    <p>{error}</p>
                    <Link to="/juego-preview" className="btn btn-primary">Volver</Link>
                </div>
            </div>
        );
    }

    if (estadoJuego === 'finalizado') {
        return (
            <div className="juego-page bg-light">
                <div className="juego-page-container text-center">
                    <div className="resultado-final-card">
                        <h2>¡Juego Terminado!</h2>
                        <p className="resultado-puntaje-label">Tu puntaje final es:</p>
                        <p className="resultado-puntaje-final">{puntaje}</p>
                        <div className="resultado-acciones">
                            <Link to="/juego-preview" className="btn btn-primary">Jugar de Nuevo</Link>
                            <Link to="/perfil" className="btn btn-secondary">Ver mi Perfil</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const preguntaActual = preguntas[preguntaActualIndex];
    const progreso = ((preguntaActualIndex + 1) / preguntas.length) * 100;

    const renderTextoPregunta = () => {
        if (!preguntaActual.preguntaTexto || !preguntaActual.respuestaCoreccta) {
            return preguntaActual.preguntaTexto;
        }

        const respuestaEscapada = preguntaActual.respuestaCoreccta.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(respuestaEscapada, 'gi');
        const placeholder = '_________';

        return preguntaActual.preguntaTexto.replace(regex, placeholder);
    };

    return (
        <div className="juego-page bg-light">
            <div className="juego-page-container">
                <div className="juego-header">
                    <Link to="/juego-preview" className="juego-salir-btn"><i className="bi bi-x-lg"></i></Link>
                    <span className="juego-nivel-cookie">{nivel?.nombre || 'Nivel'}</span>
                    <div className="juego-puntaje">
                        <i className="bi bi-star-fill"></i> {puntaje}
                    </div>
                </div>

                <div className="juego-progreso-container">
                    <div className="progress" style={{ height: '20px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${progreso}%` }} aria-valuenow={progreso} aria-valuemin="0" aria-valuemax="100">
                            <span className="juego-progreso-texto">{Math.round(progreso)}%</span>
                        </div>
                    </div>
                </div>

                <div className="juego-contenido">
                    {preguntaActual.imagenUrl ? (
                        <div className="juego-imagen-container">
                            <img src={preguntaActual.imagenUrl} alt="Pista visual" className="juego-imagen" />
                        </div>
                    ) : preguntaActual.audio_url && (
                        <div className="juego-audio-container">
                            <p>Escucha el audio:</p>
                            <audio controls src={preguntaActual.audio_url}>
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        </div>
                    )}

                    <h2 className="juego-pregunta-texto">{renderTextoPregunta()}</h2>
                    <p className="juego-pregunta-numero">Pregunta {preguntaActualIndex + 1} de {preguntas.length}</p>

                    <div className="juego-opciones-grid">
                        {preguntaActual.opciones.map((opcion, index) => {
                            let btnClass = 'juego-opcion-btn';
                            if (feedback) {
                                if (opcion.trim().toLowerCase() === preguntaActual.respuestaCoreccta.trim().toLowerCase()) {
                                    btnClass += ' correcta';
                                } else if (opcion === opcionSeleccionada) {
                                    btnClass += ' incorrecta';
                                }
                            } else if (opcion === opcionSeleccionada) {
                                btnClass += ' seleccionada';
                            }

                            return (
                                <button key={index} className={btnClass} onClick={() => handleSeleccionarOpcion(opcion)} disabled={!!feedback}>
                                    {opcion}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="juego-footer">
                    {feedback ? (
                        <button onClick={handleSiguientePregunta} className={`btn btn-lg w-100 ${feedback === 'correcta' ? 'btn-success' : 'btn-danger'}`}>
                            Siguiente
                        </button>
                    ) : (
                        <button onClick={handleComprobarRespuesta} className="btn btn-primary btn-lg w-100" disabled={!opcionSeleccionada}>
                            Comprobar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}