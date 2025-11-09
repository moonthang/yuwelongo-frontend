import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCategorias } from '../../../services/categoriasService';
import CategoriaCard from '../../../components/CategoriaCard';
import Loader from '../../../components/ui/Loader/Loader';
import './CategoriasPage.css';

const CategoriasPage = () => {
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                setLoading(true);
                const data = await obtenerCategorias();
                setCategorias(data);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar las categorías. Por favor, inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarCategorias();
    }, []);

    return (
        <div className="categorias-page bg-light">
            <div className="container mt-5">
                <div className="d-flex align-items-center mb-5">
                    <button onClick={() => navigate(-1)} className="btn-back-categorias" aria-label="Volver">
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="categorias-page-title">Todas las Categorías</h1>
                </div>
                {loading && <div className="text-center"><Loader /></div>}
                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && (
                    <div className="row">
                        {categorias.map(categoria => (
                            <div key={categoria.idCategoria} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                <CategoriaCard categoria={categoria} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriasPage;