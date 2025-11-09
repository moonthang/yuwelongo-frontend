import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buscarCategoriaPorId } from '../../../services/categoriasService';
import { obtenerPalabrasPorCategoria } from '../../../services/palabraService';
import PalabraCard from '../../../components/PalabraCard';
import Loader from '../../../components/ui/Loader/Loader';
import './CategoriaPalabrasPage.css';

const CategoriaPalabrasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categoria, setCategoria] = useState(null);
    const [palabras, setPalabras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                <PalabraCard palabra={palabra} variant="public" />
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