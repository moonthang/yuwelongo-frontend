import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from "../../../context/AuthContext";
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';
import {
    obtenerNiveles,
    crearNivel,
    actualizarNivel,
    eliminarNivel
} from '../../../services/nivelService';
import AdminNivelCard from './AdminNivelCard';

const NivelSchema = Yup.object().shape({
    nombre: Yup.string().required('El nombre es obligatorio'),
    descripcion: Yup.string().required('La descripción es obligatoria'),
    orden: Yup.number().required('El orden es obligatorio').integer('Debe ser un número entero'),
    estado: Yup.string().required('El estado es obligatorio')
});

const AdminNivelesPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditNivel, setCurrentEditNivel] = useState(null);
    const [nivelToDelete, setNivelToDelete] = useState(null);

    const fetchNiveles = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const data = await obtenerNiveles();
            data.sort((a, b) => a.orden - b.orden);
            setNiveles(data);
        } catch (error) {
            addToast('error', "Error al obtener los niveles. ¿Está activo el servicio?");
            setNiveles([]);
        } finally {
            setLoading(false);
        }
    }, [user?.token, addToast]);

    useEffect(() => {
        fetchNiveles();
    }, [fetchNiveles]);

    const handleCrearNivel = async (values, { resetForm, setSubmitting }) => {
        setLoading(true);
        try {
            await crearNivel(values);
            addToast('success', "Nivel creado con éxito.");
            resetForm();
            fetchNiveles();
        } catch (error) {
            addToast('error', `Error al crear el nivel: ${error.message}`);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleUpdateNivel = async (values, { setSubmitting }) => {
        setLoading(true);
        try {
            await actualizarNivel(values.idNivel, values);
            addToast('success', "Nivel actualizado con éxito.");
            setShowEditModal(false);
            setCurrentEditNivel(null);
            fetchNiveles();
        } catch (error) {
            addToast('error', `Error al actualizar el nivel: ${error.message}`);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleEliminarNivel = async (id) => {
        setLoading(true);
        try {
            await eliminarNivel(id);
            addToast('success', "Nivel eliminado correctamente.");
            setNivelToDelete(null);
            fetchNiveles();
        } catch (error) {
            addToast('error', `Error al eliminar el nivel: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (nivel) => {
        setCurrentEditNivel(nivel);
        setShowEditModal(true);
    };

    const preventNegativeInput = (e) => {
        if (e.key === '-' || e.key === 'e') {
            e.preventDefault();
        }
    };

    const EditNivelModal = () => {
        if (!showEditModal || !currentEditNivel) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Nivel ID: {currentEditNivel.idNivel}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <Formik
                            initialValues={currentEditNivel}
                            validationSchema={NivelSchema}
                            onSubmit={handleUpdateNivel}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form>
                                    <div className="modal-body">
                                        <div className="mb-3"><label>Nombre</label><Field name="nombre" type="text" className={`form-control ${errors.nombre && touched.nombre ? 'is-invalid' : ''}`} /><ErrorMessage name="nombre" component="div" className="invalid-feedback" /></div>
                                        <div className="mb-3"><label>Descripción</label><Field name="descripcion" as="textarea" className={`form-control ${errors.descripcion && touched.descripcion ? 'is-invalid' : ''}`} /><ErrorMessage name="descripcion" component="div" className="invalid-feedback" /></div>
                                        <div className="mb-3"><label>Orden</label><Field name="orden" type="number" min="0" onKeyDown={preventNegativeInput} className={`form-control ${errors.orden && touched.orden ? 'is-invalid' : ''}`} /><ErrorMessage name="orden" component="div" className="invalid-feedback" /></div>
                                        <div className="mb-3"><label>Estado</label><Field as="select" name="estado" className={`form-select ${errors.estado && touched.estado ? 'is-invalid' : ''}`}><option value="">Seleccione un estado</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="proximamente">Próximamente</option></Field><ErrorMessage name="estado" component="div" className="invalid-feedback" /></div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>Guardar Cambios</button>
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
        if (!nivelToDelete) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="btn-close" onClick={() => setNivelToDelete(null)}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres eliminar el nivel "<strong>{nivelToDelete.nombre}</strong>" (ID: {nivelToDelete.idNivel})?</p>
                            <p className="text-danger">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setNivelToDelete(null)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={() => handleEliminarNivel(nivelToDelete.idNivel)} disabled={loading}>
                                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) return <p className="alert alert-danger">❌ **Acceso denegado:** Debes iniciar sesión para administrar los niveles.</p>;

    return (
        <div className="admin-page bg-light flex-grow-1">
            <div className="container py-4">
                <h1>Administración de Niveles de Juego</h1>

                {loading && <Loader />}

                <div className="row mt-4">
                    <div className="col-md-5 mb-4 mb-md-0">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Crear Nuevo Nivel</h2>
                            <Formik
                                initialValues={{ nombre: '', descripcion: '', orden: '', estado: '' }}
                                validationSchema={NivelSchema}
                                onSubmit={handleCrearNivel}
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
                                            <Field name="descripcion" as="textarea" rows="3" className={`form-control ${errors.descripcion && touched.descripcion ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="descripcion" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="orden">Orden</label>
                                                <Field name="orden" type="number" min="0" onKeyDown={preventNegativeInput} className={`form-control ${errors.orden && touched.orden ? 'is-invalid' : ''}`} />
                                                <ErrorMessage name="orden" component="div" className="invalid-feedback" />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="estado">Estado</label>
                                                <Field as="select" name="estado" className={`form-select ${errors.estado && touched.estado ? 'is-invalid' : ''}`}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="activo">Activo</option>
                                                    <option value="inactivo">Inactivo</option>
                                                    <option value="proximamente">Próximamente</option>
                                                </Field>
                                                <ErrorMessage name="estado" component="div" className="invalid-feedback" />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? 'Guardando...' : 'Crear Nivel'}
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                        </section>
                    </div>

                    <div className="col-md-7">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Listado de Niveles</h2>
                            <div className="row row-cols-1 row-cols-lg-2 g-4">
                                {niveles.length > 0 ? (
                                    niveles.map((nivel) => (
                                        <AdminNivelCard
                                            key={nivel.idNivel}
                                            nivel={nivel}
                                            onEdit={handleOpenEditModal}
                                            onDelete={setNivelToDelete}
                                            loading={loading}
                                        />
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <p className="text-center text-muted mt-4">
                                            No hay niveles para mostrar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <EditNivelModal />
            <ConfirmDeleteModal />
        </div>
    );
};

export default AdminNivelesPage;