import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPreguntasPorNivel } from '../../../services/preguntaService';
import { obtenerNiveles } from '../../../services/nivelService';
import { useAuth } from '../../../context/AuthContext';
import { guardarResultado } from '../../../services/juegoResultadoService';
import Loader from '../../../components/ui/Loader/Loader';
import './JuegoPage.css';

const CANTIDAD_PREGUNTAS = 10;
export default function JuegoPage() {
    const navigate = useNavigate();
    const nivelActualRef = React.useRef(0);
    const [estadoJuego, setEstadoJuego] = useState('cargando');
    const [niveles, setNiveles] = useState([]);
    const [nivelActualIndex, setNivelActualIndex] = useState(0);
    const [preguntas, setPreguntas] = useState([]);
    const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
    const [puntajeTotal, setPuntajeTotal] = useState(0);
    const [puntajeNivel, setPuntajeNivel] = useState(0);
    const [respuestasCorrectasNivel, setRespuestasCorrectasNivel] = useState(0);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth();
    const handleSalirJuego = (ruta, limpiarPartida = false) => {
        if (limpiarPartida) {
            localStorage.removeItem('idPartida');
        }
        navigate(ruta);
    };

    useEffect(() => {
        nivelActualRef.current = nivelActualIndex;
        console.log('Nivel actual actualizado a:', nivelActualIndex);
    }, [nivelActualIndex]);

    useEffect(() => {
        const iniciarJuego = async () => {
            setEstadoJuego('cargando');
            
            let idPartidaActual = localStorage.getItem('idPartida');
            if (!idPartidaActual) {
                idPartidaActual = `partida-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('idPartida', idPartidaActual);
                console.warn('CREANDO NUEVO idPartida (no había en localStorage):', idPartidaActual);
            } else {
                console.log('RECUPERANDO idPartida existente del localStorage:', idPartidaActual);
            }
            console.log('Iniciando juego con idPartida:', idPartidaActual);
            
            try {
                const nivelesData = await obtenerNiveles();
                if (nivelesData && nivelesData.length > 0) {
                    const nivelesOrdenados = nivelesData.sort((a, b) => a.orden - b.orden);
                    setNiveles(nivelesOrdenados);
                    await cargarNivel(nivelesOrdenados[0].idNivel);
                } else {
                    setError('No se encontraron niveles de juego. Inténtalo más tarde.');
                    setEstadoJuego('error');
                }
            } catch (err) {
                setError('Hubo un problema al iniciar el juego. Por favor, vuelve a intentarlo.');
                setEstadoJuego('error');
            }
        };

        iniciarJuego();
    }, []);

    const cargarNivel = async (idNivel) => {
        setEstadoJuego('cargando');
        try {
            const data = await obtenerPreguntasPorNivel(idNivel, { aleatorias: true, cantidad: CANTIDAD_PREGUNTAS });
            if (data && data.length > 0) {
                const preguntasConOpcionesMezcladas = data.map(p => {
                    const opciones = [p.opcion1, p.opcion2, p.opcion3, p.opcion4].sort(() => Math.random() - 0.5);
                    return { ...p, opciones };
                });
                setPreguntas(preguntasConOpcionesMezcladas);
                setPreguntaActualIndex(0);
                setPuntajeNivel(0);
                setRespuestasCorrectasNivel(0);
                setEstadoJuego('jugando');
            } else {
                setError(`No se encontraron preguntas para el nivel. Inténtalo más tarde.`);
                setEstadoJuego('error');
            }
        } catch (err) {
            setError(`Hubo un problema al cargar el nivel. Por favor, vuelve a intentarlo.`);
            setEstadoJuego('error');
        }
    };

    const handleSeleccionarOpcion = (opcion) => {
        if (feedback) return;
        setOpcionSeleccionada(opcion);
    };

    const handleComprobarRespuesta = () => {
        if (!opcionSeleccionada) return;

        const preguntaActual = preguntas[preguntaActualIndex];
        if (opcionSeleccionada.trim().toLowerCase() === preguntaActual.respuestaCoreccta.trim().toLowerCase()) {
            setFeedback('correcta');
            const xpGanado = preguntaActual.xpValor || 0;
            setPuntajeTotal(prev => prev + xpGanado);
            setPuntajeNivel(prev => prev + xpGanado);
            setRespuestasCorrectasNivel(prev => prev + 1);
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
            const currentNivelIndex = nivelActualRef.current;
            console.log('Terminado nivel con índice (de ref):', currentNivelIndex, 'Niveles disponibles:', niveles.length);
            
            if (user && niveles.length > 0) {
                try {
                    const fecha = new Date();
                    const fechaJuego = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')} ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`;
                    const nivelActual = niveles[currentNivelIndex];
                    console.log('Nivel actual a guardar:', nivelActual?.nombre, 'ID:', nivelActual?.idNivel);
                    
                    const idPartidaActual = localStorage.getItem('idPartida');
                    const payload = {
                        puntaje: puntajeNivel,
                        preguntasCorrectas: respuestasCorrectasNivel,
                        totalPreguntas: preguntas.length,
                        usuario: { idUsuario: user.idUsuario },
                        nivel: { idNivel: nivelActual.idNivel },
                        fechaJuego: fechaJuego,
                        idPartida: idPartidaActual
                    };

                    const snapshot = { ...payload };

                    console.log('Guardando resultado para nivel:', nivelActual.nombre, 'Snapshot:', snapshot);
                    console.log('idPartida siendo enviado:', idPartidaActual);

                    const respuesta = await guardarResultado(snapshot);
                    console.log('Resultado guardado exitosamente:', respuesta);

                    setPuntajeNivel(0);
                    setRespuestasCorrectasNivel(0);

                } catch (saveError) {
                    console.error("Error al guardar el resultado:", saveError);
                }
            }
            setEstadoJuego('nivel-completado');
        }
    };

    const handleContinuarSiguienteNivel = async () => {
        const proximoNivelIndex = nivelActualIndex + 1;
        if (proximoNivelIndex < niveles.length) {
            setNivelActualIndex(proximoNivelIndex);
            nivelActualRef.current = proximoNivelIndex;
            
            const idPartidaActual = localStorage.getItem('idPartida');
            console.log('Continuando al siguiente nivel con idPartida:', idPartidaActual);
            await cargarNivel(niveles[proximoNivelIndex].idNivel);
        } else {
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
                    <button onClick={() => handleSalirJuego('/juego-preview', true)} className="btn btn-primary">Volver</button>
                </div>
            </div>
        );
    }

    if (estadoJuego === 'nivel-completado') {
        const esUltimoNivel = nivelActualIndex >= niveles.length - 1;
        return (
            <div className="juego-page bg-light">
                <div className="juego-page-container text-center">
                    <div className="resultado-final-card">
                        <h2>¡Nivel {niveles[nivelActualIndex].nombre} Completado!</h2>
                        <p className="resultado-puntaje-label">Puntaje total:</p>
                        <p className="resultado-puntaje-final">{puntajeTotal}</p>
                        <div className="resultado-acciones">
                            {esUltimoNivel ? (
                                <button onClick={handleContinuarSiguienteNivel} className="btn btn-success">¡Felicidades! Has completado todos los niveles.</button>
                            ) : (
                                <button onClick={handleContinuarSiguienteNivel} className="btn btn-primary">Continuar al siguiente nivel</button>
                            )}
                            <button onClick={() => handleSalirJuego('/juego-preview', false)} className="btn btn-secondary">Salir</button>
                        </div>
                    </div>
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
                        <p className="resultado-puntaje-final">{puntajeTotal}</p>
                        <div className="resultado-acciones">
                            <button onClick={() => handleSalirJuego('/juego-preview', true)} className="btn btn-primary">Jugar de Nuevo</button>
                            <button onClick={() => handleSalirJuego('/perfil', true)} className="btn btn-secondary">Ver mi Perfil</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const nivelActual = niveles[nivelActualIndex];
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
                    <button onClick={() => handleSalirJuego('/juego-preview', false)} className="juego-salir-btn"><i className="bi bi-x-lg"></i></button>
                    <span className="juego-nivel-cookie">{nivelActual?.nombre || 'Nivel'}</span>
                    <div className="juego-puntaje">
                        <i className="bi bi-star-fill"></i> {puntajeTotal}
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