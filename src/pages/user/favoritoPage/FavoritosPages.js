import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { obtenerFavoritosPorUsuario, eliminarFavorito } from '../../../services/favoritosService';
import PalabraCard from '../../../components/PalabraCard';
import Loader from '../../../components/ui/Loader/Loader';
import './FavoritosPage.css';

const FavoritosPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            if (!user || !user.idUsuario) {
                setError("No se pudo verificar el usuario.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const favoritosData = await obtenerFavoritosPorUsuario(user.idUsuario);

                setFavoritos(favoritosData || []);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los favoritos. Inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [user]);

    const handleEliminarFavorito = async (idFavorito, idPalabra) => {
        try {
            await eliminarFavorito(idFavorito);
            setFavoritos(prev => prev.filter(fav => fav.idFavorito !== idFavorito));
            addToast('success', 'Palabra eliminada de favoritos.');
        } catch (err) {
            console.error('Error eliminando favorito:', err);
            addToast('error', 'No se pudo eliminar el favorito.');
        }
    };

    const filteredPalabras = useMemo(() => {
        let palabras = favoritos.map(fav => ({ ...fav.palabra, idFavorito: fav.idFavorito }));

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            palabras = palabras.filter(p =>
                p.palabraNasa.toLowerCase().includes(lowercasedFilter) ||
                p.traduccion.toLowerCase().includes(lowercasedFilter)
            );
        }

        return palabras;
    }, [favoritos, searchTerm]);

    if (loading) {
        return <div className="container text-center mt-5"><Loader /></div>;
    }

    if (error) {
        return <div className="container mt-5 text-center"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="favoritos-page bg-light">
            <div className="container py-5">
                <h1 className="mb-4 text-center">Mis Palabras Favoritas</h1>

                <div className="mb-4 mx-auto search-wrapper" style={{ maxWidth: '500px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search search-icon" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar en mis favoritos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="row">
                    {filteredPalabras.length > 0 ? (
                        filteredPalabras.map(palabra => (
                            <div key={palabra.idPalabra} className="col-lg-4 col-md-6 mb-4">
                                <PalabraCard
                                    palabra={palabra}
                                    variant="public"
                                    esFavorito={true}
                                    onToggleFavorito={() => handleEliminarFavorito(palabra.idFavorito, palabra.idPalabra)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            {favoritos.length === 0 ? (
                                <>
                                    <p className="lead">Aún no tienes palabras guardadas.</p>
                                    <p>¡Explora el diccionario y comienza a armar tu colección!</p>
                                    <Link to="/diccionario" className="btn btn-primary mt-2">Ir al Diccionario</Link>
                                </>
                            ) : <p>No se encontraron palabras que coincidan con tu búsqueda.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritosPage;