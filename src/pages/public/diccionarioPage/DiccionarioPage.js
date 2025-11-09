import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPalabras } from '../../../services/palabraService';
import { obtenerCategorias } from '../../../services/categoriasService';
import PalabraCard from '../../../components/PalabraCard';
import './DiccionarioPage.css';
import Loader from '../../../components/ui/Loader/Loader';

const DiccionarioPage = () => {
    const [palabras, setPalabras] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filteredPalabras, setFilteredPalabras] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                    <PalabraCard palabra={palabra} categorias={categorias} variant="public" />
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