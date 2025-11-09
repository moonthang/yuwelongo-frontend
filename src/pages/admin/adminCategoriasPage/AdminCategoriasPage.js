import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from "../../../context/AuthContext";
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';
import {
    obtenerCategorias,
    buscarCategoria,
    crearCategoria,
    eliminarCategoria,
    actualizarCategoria
} from '../../../services/categoriasService'; 
import { subirArchivo, eliminarArchivo } from '../../../services/mediaService';
import AdminCategoriaCard from './AdminCategoriaCard';

const CrearCategoriaSchema = Yup.object().shape({
    nombre: Yup.string()
        .required('El nombre es obligatorio'),
    descripcion: Yup.string()
        .required('La descripción es obligatoria'),
    imagenUrl: Yup.string().url('Formato de URL inválido').nullable(),
});

const EditarCategoriaSchema = Yup.object().shape({
    id: Yup.number().required(),
    nombre: Yup.string().required('El nombre es obligatorio'),
    descripcion: Yup.string().required('La descripción es obligatoria'),
    imagenUrl: Yup.string().url('Formato de URL inválido').nullable(),
});

const AdminCategoriesPage = () => {
    const { user } = useAuth();
    const token = user?.token;

    const { addToast } = useToast();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);  
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditCategory, setCurrentEditCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [editSelectedFile, setEditSelectedFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    const fetchCategorias = useCallback(async (nombre = '') => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = nombre.trim() 
                ? await buscarCategoria(nombre, token)
                : await obtenerCategorias(token);
            
            setCategorias(data.map(c => ({ 
                id: c.id || c.idCategoria, 
                nombre: c.nombre, 
                descripcion: c.descripcion, 
                imagenUrl: c.imagenUrl,
                hygraphAssetId: c.hygraphAssetId
            })));
            
            if(nombre.trim()) {
                addToast('info', `Resultados encontrados para: ${nombre}`);
            }

        } catch (error) {
            addToast('error', "Error al obtener categorías. ¿Está activo el servicio?");
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }, [token, addToast]);

    useEffect(() => {
        if (token) {
            fetchCategorias();
        } else {
            setLoading(false);
        }
    }, [token, fetchCategorias]);

    const handleBuscar = (e) => {
        e.preventDefault();
        fetchCategorias(searchTerm);
    };

    useEffect(() => {
        const preview = imagePreview;
        const editPreview = editImagePreview;
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
            if (editPreview) {
                URL.revokeObjectURL(editPreview);
            }
        };
    }, [imagePreview, editImagePreview]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setImagePreview(null);
        }
    };

    const handleEditFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setEditSelectedFile(file);
            setEditImagePreview(URL.createObjectURL(file));
        } else {
            setEditSelectedFile(null);
            setEditImagePreview(null);
        }
    };


    const handleCrearCategoria = async (values, { resetForm, setSubmitting }) => {
        setLoading(true);
        let finalValues = { ...values };

        if (selectedFile) {
            setUploading(true);

            try {
                const assetData = await subirArchivo(selectedFile, "categorias");
                finalValues.imagenUrl = assetData.url;
                finalValues.hygraphAssetId = assetData.filePath;

            } catch (uploadError) {
                addToast('error', `Error de subida: ${uploadError.message}`);
                setLoading(false);
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        try {
            await crearCategoria(finalValues, token); 
            addToast('success', "Categoría creada con éxito.");
            resetForm();
            setSelectedFile(null);
            setImagePreview(null);
            fetchCategorias();
        } catch (error) {
            addToast('error', `Error al crear: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategoria = async (values, { setSubmitting }) => {
        setLoading(true);
        setSubmitting(true);
        let finalValues = { ...values };

        if (editSelectedFile) {
            setUploading(true);

            try {
                const newAssetData = await subirArchivo(editSelectedFile, "categorias");
                finalValues.imagenUrl = newAssetData.url;
                finalValues.hygraphAssetId = newAssetData.filePath;

                if (currentEditCategory.hygraphAssetId) {
                    await eliminarArchivo(currentEditCategory.hygraphAssetId);
                }

            } catch (uploadError) {
                addToast('error', `Error en la gestión de archivos: ${uploadError.message}`);
                setSubmitting(false);
                setLoading(false);
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        try {
            await actualizarCategoria(finalValues, token);
            addToast('success', "Categoría actualizada con éxito.");
            setShowEditModal(false);
            setEditSelectedFile(null);
            setEditImagePreview(null);
            fetchCategorias();
        } catch (error) {
            addToast('error', `Error al actualizar: ${error.message}`);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleEliminarCategoria = async (id) => {
        setLoading(true);
        try {
            const data = await eliminarCategoria(id, token);
            addToast('success', data.mensaje || "Categoría eliminada correctamente.");
            setCategoryToDelete(null);
            fetchCategorias();
        } catch (error) {
            addToast('error', `Error al eliminar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (category) => {
        setCurrentEditCategory({
            id: category.id,
            nombre: category.nombre,
            descripcion: category.descripcion,
            imagenUrl: category.imagenUrl || '',
            hygraphAssetId: category.hygraphAssetId || null,
        });
        setShowEditModal(true);
        setEditSelectedFile(null);
        setEditImagePreview(null);
    };

    const EditCategoryModal = () => {
        if (!showEditModal || !currentEditCategory) return null;

        return (
            <div className="modal d-block" tabIndex="-1" >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Categoría ID: {currentEditCategory.id}</h5>
                            <button type="button" className="btn-close" onClick={() => {
                                setShowEditModal(false);
                                setEditImagePreview(null);
                                setEditSelectedFile(null);
                            }}></button>
                        </div>
                        <Formik
                            initialValues={currentEditCategory}
                            validationSchema={EditarCategoriaSchema}
                            onSubmit={handleUpdateCategoria}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="editNombre" className="form-label">Nombre</label>
                                            <Field name="nombre" type="text" id="editNombre" className={`form-control ${errors.nombre && touched.nombre ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editDescripcion" className="form-label">Descripción</label>
                                            <Field name="descripcion" type="text" id="editDescripcion" className={`form-control ${errors.descripcion && touched.descripcion ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="descripcion" component="div" className="invalid-feedback" />
                                        </div>
                                        <hr />
                                        <p><strong>Imagen de la Categoría</strong></p>
                                        <div className="text-center mb-3">
                                            <img 
                                                src={editImagePreview || currentEditCategory.imagenUrl || 'https://via.placeholder.com/150'} 
                                                alt="Imagen de la categoría" 
                                                className="img-thumbnail" 
                                                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editImagenFile" className="form-label">Cambiar Imagen (Opcional)</label>
                                            <input 
                                                id="editImagenFile" 
                                                name="editImagenFile" 
                                                type="file" 
                                                onChange={handleEditFileChange}
                                                className="form-control" 
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn btn-success" disabled={isSubmitting || uploading}>
                                            {uploading ? 'Subiendo...' : (isSubmitting ? 'Guardando...' : 'Guardar Cambios')}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        );
    };
    
    const ConfirmDeleteModal = () => {
        if (!categoryToDelete) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="btn-close" onClick={() => setCategoryToDelete(null)}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres eliminar la categoría "<strong>{categoryToDelete.nombre}</strong>" (ID: {categoryToDelete.id})?</p>
                            <p className="text-danger">Esta acción no se puede deshacer y también eliminará los archivos asociados.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setCategoryToDelete(null)}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={() => handleEliminarCategoria(categoryToDelete.id)}
                                disabled={loading}
                            >
                                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) return <p className="alert alert-danger">❌ **Acceso denegado:** Debes iniciar sesión para administrar categorías.</p>;
    
    return (
        <div className="admin-categories-page bg-light flex-grow-1">
            <div className="container py-4">
            <h1>Administración de Categorías</h1>

            {loading && <Loader />}

            <div className="row mt-4">
                <div className="col-md-5 mb-4 mb-md-0">
                    <section className="p-4 border rounded shadow-sm bg-white h-100">
                        <h2>Crear Nueva Categoría</h2>
                        <Formik
                            initialValues={{ nombre: '', descripcion: '', imagenUrl: '' }}
                            validationSchema={CrearCategoriaSchema}
                            onSubmit={handleCrearCategoria}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form>
                                    <div className="mb-3">
                                        <label htmlFor="nombre">Nombre</label>
                                        <Field name="nombre" type="text" className={`form-control ${errors.nombre && touched.nombre ? 'is-invalid' : ''}`} />
                                        <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="descripcion">Descripción</label>
                                        <Field name="descripcion" type="text" className={`form-control ${errors.descripcion && touched.descripcion ? 'is-invalid' : ''}`} />
                                        <ErrorMessage name="descripcion" component="div" className="invalid-feedback" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="imagenFile">Imagen</label>
                                        <input 
                                            id="imagenFile" 
                                            name="imagenFile" 
                                            type="file" 
                                            onChange={handleFileChange}
                                            className="form-control" 
                                        />
                                    </div>
                                    {imagePreview && (
                                        <div className="mb-3">
                                            <p>Vista previa:</p>
                                            <img src={imagePreview} alt="Vista previa de la categoría" className="img-thumbnail" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                        </div>
                                    )}
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || uploading}>
                                        {uploading ? 'Subiendo imagen...' : (isSubmitting ? 'Guardando...' : 'Crear Categoría')}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </section>
                </div>

                <div className="col-md-7">
                    <section className="p-4 border rounded shadow-sm bg-white h-100">
                        <h2>Buscar y Listar Categorías</h2>
                        <form onSubmit={handleBuscar} className="mb-4 d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Buscar por Nombre de categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="btn btn-info me-2" disabled={loading} title="Buscar">
                                <i className="bi bi-search"></i>
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => { setSearchTerm(''); fetchCategorias(); }} disabled={loading}>
                                Todas
                            </button>
                        </form>

                        <div className="row row-cols-1 g-4">
                            {categorias.length > 0 ? (
                                categorias.map((cat) => (
                                    <AdminCategoriaCard 
                                        key={cat.id}
                                        category={cat}
                                        onEdit={handleOpenEditModal}
                                        onDelete={setCategoryToDelete}
                                        loading={loading}
                                    />
                                ))
                            ) : (
                                <div className="col-12">
                                    <p className="text-center text-muted mt-4">
                                        No hay categorías para mostrar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            </div>

            <EditCategoryModal />
            <ConfirmDeleteModal />
        </div>
    );
};

export default AdminCategoriesPage;