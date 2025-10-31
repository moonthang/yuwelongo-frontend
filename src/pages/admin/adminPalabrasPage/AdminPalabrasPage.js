"use client";
import { useEffect, useState, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
    getPalabras,
    crearPalabra,
    actualizarPalabra,
    eliminarPalabra,
    buscarPalabra,
} from "../../../services/palabraService";
import { getCategorias } from "../../../services/categoriasService";
import { subirArchivo, eliminarArchivo } from "../../../services/mediaService";
import Loader from "../../../components/ui/Loader/Loader";
import PalabraCard from "../../../components/PalabraCard";
import "../../../components/PalabraCard.css";

const PalabraSchema = Yup.object().shape({
    palabraNasa: Yup.string().required('La palabra en Nasa Yuwe es obligatoria'),
    traduccion: Yup.string(),
    fraseEjemplo: Yup.string(),
    idCategoria: Yup.number().nullable().required('La categoría es obligatoria'),
});

const initialValues = {
    palabraNasa: '',
    traduccion: '',
    fraseEjemplo: '',
    idCategoria: null,
    imagenFile: null,
    audioFile: null,
    imagenUrl: '',
    imagenPath: '',
    audioUrl: '',
    audioPath: ''
};

export default function AdminPalabrasPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [palabras, setPalabras] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [tipoBusqueda, setTipoBusqueda] = useState("palabraNasa");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditPalabra, setCurrentEditPalabra] = useState(null);
    const [palabraAEliminar, setPalabraAEliminar] = useState(null);
    const [selectedFile, setSelectedFile] = useState({ imagen: null, audio: null });
    const [editSelectedFile, setEditSelectedFile] = useState({ imagen: null, audio: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [categoriaSearchTerm, setCategoriaSearchTerm] = useState('');
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [createCategoriaSearchTerm, setCreateCategoriaSearchTerm] = useState('');
    const [createFilteredCategorias, setCreateFilteredCategorias] = useState([]);
    const cargarDatos = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const [palabrasData, categoriasData] = await Promise.all([
                getPalabras(user.token),
                getCategorias()
            ]);
            setPalabras(palabrasData);
            const normalizedCategorias = categoriasData.map(c => ({
                ...c,
                id: c.id || c.id_categoria || c.idCategoria
            }));
            setCategorias(normalizedCategorias);

        } catch (error) {
            addToast("error", "Error al cargar datos: " + error.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token, addToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        const preview = imagePreview;
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [imagePreview]);

    const handleBuscar = async () => {
        if (!busqueda.trim()) return cargarDatos();
        try {
            setLoading(true);
            const data = await buscarPalabra(busqueda, tipoBusqueda, user.token);
            setPalabras(data);
        } catch (error) {
            addToast("error", "Error al buscar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event, type, isEdit = false) => {
        const file = event.target.files[0];
        if (isEdit) {
            setEditSelectedFile(prev => ({ ...prev, [type]: file }));
        } else if (type === 'imagen') {
            setSelectedFile(prev => ({ ...prev, imagen: file }));
            if (file) {
                setImagePreview(URL.createObjectURL(file));
            } else {
                setImagePreview(null);
            }
        } else {
            setSelectedFile(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleCrearPalabra = async (values, { resetForm }) => {
        setLoading(true);
        let finalValues = { ...values };

        finalValues.idCategoria = parseInt(finalValues.idCategoria, 10);
        finalValues.fecha_creacion = new Date().toISOString();
        try {
            if (selectedFile.imagen) {
                const asset = await subirArchivo(selectedFile.imagen, "palabras/imagenes");
                finalValues.imagenUrl = asset.url;
                finalValues.imagenPath = asset.filePath;
            }
            if (selectedFile.audio) {
                const asset = await subirArchivo(selectedFile.audio, "palabras/audios");
                finalValues.audioUrl = asset.url;
                finalValues.audioPath = asset.filePath;
            }

            await crearPalabra(finalValues, user.token);
            addToast("success", "Palabra creada con éxito.");
            resetForm();
            setSelectedFile({ imagen: null, audio: null });
            setImagePreview(null);
            setCreateCategoriaSearchTerm('');
            setCreateFilteredCategorias([]);
            cargarDatos();
        } catch (error) {
            addToast("error", `Error al crear: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePalabra = async (values) => {
        setLoading(true);
        let finalValues = { ...values };

        finalValues.idCategoria = parseInt(finalValues.idCategoria, 10);
        finalValues.fecha_actualizacion = new Date().toISOString();
        try {
            if (editSelectedFile.imagen) {
                if (currentEditPalabra.imagenPath) await eliminarArchivo(currentEditPalabra.imagenPath);
                const asset = await subirArchivo(editSelectedFile.imagen, "palabras/imagenes");
                finalValues.imagenUrl = asset.url;
                finalValues.imagenPath = asset.filePath;
            }
            if (editSelectedFile.audio) {
                if (currentEditPalabra.audioPath) await eliminarArchivo(currentEditPalabra.audioPath);
                const asset = await subirArchivo(editSelectedFile.audio, "palabras/audios");
                finalValues.audioUrl = asset.url;
                finalValues.audioPath = asset.filePath;
            }

            await actualizarPalabra(finalValues, user.token);
            addToast("success", "Palabra actualizada con éxito.");
            setShowEditModal(false);
            cargarDatos();
        } catch (error) {
            addToast("error", `Error al actualizar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (palabra) => {
        setCurrentEditPalabra({
            id: palabra.id,
            palabraNasa: palabra.palabraNasa,
            traduccion: palabra.traduccion || "",
            fraseEjemplo: palabra.fraseEjemplo || palabra.frase_ejemplo || "",
            imagenUrl: palabra.imagenUrl || "",
            imagenPath: palabra.imagen_path || "",
            audioUrl: palabra.audioUrl || "",
            audioPath: palabra.audio_path || "",
            idCategoria: palabra.idCategoria || null,
        });
        setShowEditModal(true);
        setEditSelectedFile({ imagen: null, audio: null });

        setCategoriaSearchTerm('');
    };

    const handleConfirmarEliminar = async () => {
        if (!palabraAEliminar) return;
        setLoading(true);
        try {
            await eliminarPalabra(palabraAEliminar.id, user.token);
            if (palabraAEliminar.imagenPath) await eliminarArchivo(palabraAEliminar.imagenPath);
            if (palabraAEliminar.audioPath) await eliminarArchivo(palabraAEliminar.audioPath);
            addToast("success", "Palabra eliminada correctamente.");
            setPalabraAEliminar(null);
            cargarDatos();
        } catch (error) {
            addToast("error", `Error al eliminar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const normalizeString = (str) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const handleCategoriaSearch = (e, setFieldValue) => {
        const term = e.target.value;
        setCategoriaSearchTerm(term);
        const normalizedTerm = normalizeString(term);
        if (term) {
            setFilteredCategorias(categorias.filter(c => normalizeString(c.nombre).includes(normalizedTerm)));
        } else {
            setFilteredCategorias([]);
            setFieldValue('idCategoria', null);
        }
    };

    const handleCreateCategoriaSearch = (e, setFieldValue) => {
        const term = e.target.value;
        setCreateCategoriaSearchTerm(term);
        const normalizedTerm = normalizeString(term);
        if (term) {
            setCreateFilteredCategorias(categorias.filter(c => normalizeString(c.nombre).includes(normalizedTerm)));
        } else {
            setCreateFilteredCategorias([]);
            setFieldValue('idCategoria', null);
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentPalabras = palabras.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(palabras.length / ITEMS_PER_PAGE);
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="admin-palabras-page bg-light flex-grow-1">
            {loading && <Loader />}
            <div className="container py-4">
                <h1 className="mb-4">Administración de Palabras</h1>

                {palabraAEliminar && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirmar Eliminación</h5>
                                    <button type="button" className="btn-close" onClick={() => setPalabraAEliminar(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>¿Seguro que quieres eliminar la palabra "<strong>{palabraAEliminar.palabraNasa}</strong>"?</p>
                                    <p className="text-danger">Esta acción es irreversible y eliminará los archivos asociados.</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setPalabraAEliminar(null)}>Cancelar</button>
                                    <button type="button" className="btn btn-danger" onClick={handleConfirmarEliminar} disabled={loading}>
                                        {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row mt-4">
                    <div className="col-md-5 mb-4 mb-md-0">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Crear Nueva Palabra</h2>
                            <Formik initialValues={initialValues} validationSchema={PalabraSchema} onSubmit={handleCrearPalabra}>
                                {({ isSubmitting, setFieldValue }) => (
                                    <Form>
                                        <div className="mb-3"><label>Palabra Nasa</label><Field name="palabraNasa" type="text" className="form-control" /><ErrorMessage name="palabraNasa" component="div" className="text-danger" /></div>
                                        <div className="mb-3"><label>Traducción</label><Field name="traduccion" type="text" className="form-control" /></div>
                                        <div className="mb-3"><label>Frase de Ejemplo</label><Field name="fraseEjemplo" type="text" className="form-control" /></div>
                                        <div className="mb-3 position-relative">
                                            <label>Categoría</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={createCategoriaSearchTerm}
                                                onChange={(e) => handleCreateCategoriaSearch(e, setFieldValue)}
                                                placeholder="Buscar categoría..."
                                            />
                                            {createFilteredCategorias.length > 0 && (
                                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                                                    {createFilteredCategorias.map(c => (
                                                        <li key={c.id} className="list-group-item list-group-item-action" onClick={() => { setFieldValue('idCategoria', c.id); setCreateCategoriaSearchTerm(`${c.nombre} (ID: ${c.id})`); setCreateFilteredCategorias([]); }}>{`${c.nombre} (ID: ${c.id})`}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            <ErrorMessage name="idCategoria" component="div" className="text-danger" />
                                        </div>
                                        <div className="mb-3"><label>Imagen</label><input name="imagenFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imagen')} className="form-control" /></div>
                                        {imagePreview && (
                                            <div className="mb-3 text-center">
                                                <p className="mb-1">Vista previa:</p>
                                                <img src={imagePreview} alt="Vista previa" className="img-thumbnail" style={{ maxWidth: '150px', maxHeight: '150px' }} />
                                            </div>
                                        )}
                                        <div className="mb-3"><label>Audio</label><input name="audioFile" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="form-control" /></div>
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>{isSubmitting ? 'Creando...' : 'Crear Palabra'}</button>
                                    </Form>
                                )}
                            </Formik>
                        </section>
                    </div>

                    <div className="col-md-7">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Buscar y Listar Palabras</h2>
                            <div className="d-flex mb-4 gap-2">
                                <input type="text" className="form-control" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                                <select value={tipoBusqueda} onChange={(e) => setTipoBusqueda(e.target.value)} className="form-select w-auto"><option value="palabraNasa">Por Palabra Nasa</option><option value="traduccion">Por Traducción</option></select>
                                <button onClick={handleBuscar} className="btn btn-info"><i className="bi bi-search"></i></button>
                                <button onClick={() => { setBusqueda(''); cargarDatos(); }} className="btn btn-secondary">Todas</button>
                            </div>
                            <div className="row row-cols-1 row-cols-lg-2 g-4">
                                {currentPalabras.map((p) => {
                                    return (<div key={p.id || p.id_palabra} className="col">
                                        <PalabraCard
                                            palabra={p}
                                            variant="admin"
                                            categorias={categorias}
                                            onEdit={() => handleOpenEditModal(p)}
                                            onDelete={() => setPalabraAEliminar(p)}
                                        />
                                    </div>);
                                })}
                                {palabras.length === 0 && !loading && (
                                    <div className="col-12 text-center">
                                        <p>No se encontraron palabras.</p>
                                    </div>
                                )}
                            </div>
                            {totalPages > 1 && (
                                <nav className="mt-4 d-flex justify-content-center">
                                    <ul className="pagination">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Anterior</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Siguiente</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </section>
                    </div>
                </div>

                {showEditModal && currentEditPalabra && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header"><h5 className="modal-title">Editar Palabra</h5><button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button></div>
                                <Formik initialValues={currentEditPalabra} validationSchema={PalabraSchema} onSubmit={handleUpdatePalabra} enableReinitialize>
                                    {({ isSubmitting, values, setFieldValue }) => (
                                        <Form>
                                            <div className="modal-body">
                                                <div className="mb-3"><label>Palabra Nasa</label><Field name="palabraNasa" type="text" className="form-control" /><ErrorMessage name="palabraNasa" component="div" className="text-danger" /></div>
                                                <div className="mb-3"><label>Traducción</label><Field name="traduccion" type="text" className="form-control" /></div>
                                                <div className="mb-3"><label>Frase de Ejemplo</label><Field name="fraseEjemplo" type="text" className="form-control" /></div>
                                                <div className="mb-3 position-relative">
                                                    <label>
                                                        Categoría
                                                        {values.idCategoria && (
                                                            <span className="text-muted small ms-2">
                                                                (Actual: {categorias.find(c => c.id === values.idCategoria)?.nombre || 'Desconocida'} (ID: {values.idCategoria}))
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={categoriaSearchTerm}
                                                        onChange={(e) => handleCategoriaSearch(e, setFieldValue)}
                                                        placeholder="Dejar vacío para mantener, o buscar para cambiar..."
                                                    />
                                                    {filteredCategorias.length > 0 && (
                                                        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                                                            {filteredCategorias.map(c => (
                                                                <li key={c.id} className="list-group-item list-group-item-action" onClick={() => { setFieldValue('idCategoria', c.id); setCategoriaSearchTerm(`${c.nombre} (ID: ${c.id})`); setFilteredCategorias([]); }}>{`${c.nombre} (ID: ${c.id})`}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <ErrorMessage name="idCategoria" component="div" className="text-danger" />
                                                </div>
                                                <hr />
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label>Cambiar Imagen</label>
                                                        <input name="imagenFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imagen', true)} className="form-control" />
                                                        {values.imagenUrl && (
                                                            <div className="mt-2 text-center">
                                                                <p className="mb-1 small">Imagen actual:</p>
                                                                <img src={values.imagenUrl} alt="Preview" className="img-thumbnail" style={{ maxWidth: '150px', maxHeight: '150px' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label>Cambiar Audio</label>
                                                        <input name="audioFile" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio', true)} className="form-control" />
                                                        {values.audioUrl && (
                                                            <div className="mt-2"><p className="mb-1 small">Audio actual:</p><audio controls src={values.audioUrl} className="w-100">Tu navegador no soporta el elemento de audio.</audio></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                                <button type="submit" className="btn btn-success" disabled={isSubmitting || loading}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}