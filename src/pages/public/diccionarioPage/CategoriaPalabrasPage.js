import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buscarCategoriaPorId } from '../../../services/categoriasService';
import { obtenerPalabrasPorCategoria } from '../../../services/palabraService';
import PalabraCard from '../../../components/PalabraCard';
import Loader from '../../../components/ui/Loader/Loader';
import './CategoriaPalabrasPage.css';
import { useAuth } from '../../../context/AuthContext';
import { agregarFavorito, eliminarFavorito, obtenerFavoritosPorUsuario } from '../../../services/favoritosService';
import { useToast } from '../../../context/ToastContext';

const CategoriaPalabrasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categoria, setCategoria] = useState(null);
    const [palabras, setPalabras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [favoritosMap, setFavoritosMap] = useState(new Map());

    useEffect(() => {
        const cargarDatosDeCategoria = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [categoriaData, palabrasData] = await Promise.all([
                    buscarCategoriaPorId(id),
                    obtenerPalabrasPorCategoria(id)
                ]);

                setCategoria(categoriaData);
                setPalabras(palabrasData);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los datos de la categoría. Es posible que no exista.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatosDeCategoria();
    }, [id]);

    useEffect(() => {
        let mounted = true;
        async function cargarFavoritos() {
            if (!user || !user.idUsuario) {
                setFavoritosMap(new Map());
                return;
            }
            try {
                const favs = await obtenerFavoritosPorUsuario(user.idUsuario);
                if (!mounted) return;
                const map = new Map();
                (favs || []).forEach(fav => {
                    const pid = fav.palabra?.idPalabra || fav.idPalabra || fav.palabraId;
                    const fid = fav.idFavorito || fav.id || fav.idFav;
                    if (pid) map.set(pid, fid || fav);
                });
                setFavoritosMap(map);
            } catch (err) {
                console.error('Error cargando favoritos:', err);
            }
        }

        cargarFavoritos();
        return () => { mounted = false; };
    }, [user]);

    const toggleFavorito = async (palabra) => {
        if (!user || !user.idUsuario) return;
        const idPalabra = palabra.idPalabra || palabra.id || palabra.id;
        const existing = favoritosMap.get(idPalabra);
        if (existing) {
            try {
                const favId = typeof existing === 'object' ? (existing.idFavorito || existing.id || existing.idFav) : existing;
                if (favId) {
                    await eliminarFavorito(favId);
                }
                const newMap = new Map(favoritosMap);
                newMap.delete(idPalabra);
                setFavoritosMap(newMap);
                addToast('success', 'Palabra eliminada de favoritos.');
            } catch (err) {
                console.error('Error eliminando favorito:', err);
                addToast('error', 'No se pudo eliminar el favorito.');
            }
        } else {
            try {
                const res = await agregarFavorito(user.idUsuario, idPalabra);
                const fid = res?.idFavorito || res?.id || res?.idFav;
                const newMap = new Map(favoritosMap);
                if (fid) newMap.set(idPalabra, fid);
                else newMap.set(idPalabra, res);
                setFavoritosMap(newMap);
                addToast('success', 'Palabra agregada a favoritos.');
            } catch (err) {
                console.error('Error agregando favorito:', err);
                addToast('error', 'No se pudo agregar a favoritos.');
            }
        }
    };

    if (loading) {
        return <div className="container text-center mt-5"><Loader /></div>;
    }

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <Link to="/diccionario" className="btn btn-primary">Volver al Diccionario</Link>
            </div>
        );
    }

    const limpiarDescripcion = (descripcion) => {
        if (!descripcion) return '';
        return descripcion.replace(/\s*\(Creado:.*\)$/, '').trim();
    };

    return (
        <div className="categoria-palabras-page">
            {categoria && (
                <header className="categoria-header" style={{ backgroundImage: `url(${categoria.imagenUrl})` }}>
                    <button onClick={() => navigate(-1)} className="btn-back" aria-label="Volver">
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div className="categoria-header-overlay">
                        <div className="container">
                            <h1 className="categoria-title">{categoria.nombre}</h1>
                            <p className="categoria-description">{limpiarDescripcion(categoria.descripcion)}</p>
                        </div>
                    </div>
                </header>
            )}

            <main className="container mt-5">
                <div className="row">
                    {palabras.length > 0 ? (
                        palabras.map(palabra => (
                            <div key={palabra.idPalabra} className="col-lg-4 col-md-6 mb-4">
                                <PalabraCard
                                    palabra={palabra}
                                    variant="public"
                                    onToggleFavorito={() => toggleFavorito(palabra)}
                                    esFavorito={favoritosMap.has(palabra.idPalabra)}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No hay palabras en esta categoría todavía.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CategoriaPalabrasPage;