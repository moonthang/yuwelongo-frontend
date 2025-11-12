import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPalabras } from '../../../services/palabraService';
import { obtenerCategorias } from '../../../services/categoriasService';
import PalabraCard from '../../../components/PalabraCard';
import './DiccionarioPage.css';
import { useAuth } from '../../../context/AuthContext';
import { agregarFavorito, eliminarFavorito, obtenerFavoritosPorUsuario } from '../../../services/favoritosService';
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';

const DiccionarioPage = () => {
    const [palabras, setPalabras] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filteredPalabras, setFilteredPalabras] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [favoritosMap, setFavoritosMap] = useState(new Map());

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [palabrasData, categoriasData] = await Promise.all([
                    obtenerPalabras(),
                    obtenerCategorias()
                ]);
                setPalabras(palabrasData);
                setFilteredPalabras(palabrasData);
                setCategorias(categoriasData);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

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
                    const fid = fav.idFavorito || fav.id || fav.idFav || fav.idFavorito;
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
                await eliminarFavorito(favId);
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

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = palabras.filter(item =>
            item.palabraNasa.toLowerCase().includes(lowercasedFilter) ||
            item.traduccion.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredPalabras(filteredData);
    }, [searchTerm, palabras]);

    const categoriasDestacadas = categorias.slice(0, 5);

    return (
        <div className="diccionario-page bg-light">
            <div className="container mt-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <h1 className="diccionario-title">Explorador de Vocabulario</h1>
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-12 search-wrapper">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar palabra en Nasa Yuwe o español..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="bi bi-search search-icon"></i>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12 categorias-filter-bar">
                        <Link to="/categorias" className="btn btn-secondary me-3">
                            Todas las categorías
                        </Link>
                        {categoriasDestacadas.map(cat => (
                            <Link key={cat.idCategoria} to={`/diccionario/categoria/${cat.idCategoria}`} className="btn btn-outline-primary me-2">
                                {cat.nombre}
                            </Link>
                        ))}
                    </div>
                </div>

                {loading && <Loader />}
                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && (
                    <div className="row" >
                        {filteredPalabras.length > 0 ? (
                            filteredPalabras.map(palabra => (
                                <div key={palabra.idPalabra} className="col-lg-4 col-md-6 mb-4">
                                    <PalabraCard
                                        palabra={palabra}
                                        categorias={categorias}
                                        variant="public"
                                        onToggleFavorito={() => toggleFavorito(palabra)}
                                        esFavorito={favoritosMap.has(palabra.idPalabra)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-center">No se encontraron palabras que coincidan con la búsqueda.</p>
                            </div>

                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiccionarioPage;