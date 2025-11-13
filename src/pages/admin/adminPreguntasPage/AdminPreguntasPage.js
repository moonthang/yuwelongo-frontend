import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { useAuth } from "../../../context/AuthContext";
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';
import { obtenerPreguntas, crearPregunta, actualizarPregunta, eliminarPregunta } from '../../../services/preguntaService';
import { obtenerNiveles } from '../../../services/nivelService';
import { obtenerPalabras } from '../../../services/palabraService';
import AdminPreguntaCard from './AdminPreguntaCard';

const PreguntaSchema = Yup.object().shape({
    idPalabra: Yup.number().required('Debe seleccionar la palabra correcta.').min(1, 'Debe seleccionar la palabra correcta.'),
    preguntaTexto: Yup.string().required('El texto de la pregunta es obligatorio (se autocompleta al elegir una palabra).'),
    tipo_pregunta: Yup.string().required('Debe seleccionar el tipo de pregunta (imagen o audio).'),
    opcion1: Yup.string()
        .required('La opción 1 es obligatoria')
        .notOneOf([Yup.ref('opcion2'), Yup.ref('opcion3'), Yup.ref('opcion4')], 'Las opciones no pueden repetirse.'),
    opcion2: Yup.string()
        .required('La opción 2 es obligatoria')
        .notOneOf([Yup.ref('opcion1'), Yup.ref('opcion3'), Yup.ref('opcion4')], 'Las opciones no pueden repetirse.'),
    opcion3: Yup.string()
        .required('La opción 3 es obligatoria')
        .notOneOf([Yup.ref('opcion1'), Yup.ref('opcion2'), Yup.ref('opcion4')], 'Las opciones no pueden repetirse.'),
    opcion4: Yup.string()
        .required('La opción 4 es obligatoria')
        .notOneOf([Yup.ref('opcion1'), Yup.ref('opcion2'), Yup.ref('opcion3')], 'Las opciones no pueden repetirse.'),
    xpValor: Yup.number().required('El valor de XP es obligatorio').min(0, 'No puede ser negativo'),
    idNivel: Yup.number().required('El nivel es obligatorio').min(1, 'Debe seleccionar un nivel')
});

const AdminPreguntasPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [preguntas, setPreguntas] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [palabras, setPalabras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditPregunta, setCurrentEditPregunta] = useState(null);
    const [preguntaToDelete, setPreguntaToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [currentPreviewPregunta, setCurrentPreviewPregunta] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const [preguntasData, nivelesData, palabrasData] = await Promise.all([
                obtenerPreguntas(),
                obtenerNiveles(),
                obtenerPalabras()
            ]);
            setPreguntas(preguntasData);
            setNiveles(nivelesData);
            setPalabras(palabrasData);
            setCurrentPage(1);
        } catch (error) {
            addToast('error', "Error al obtener los datos. ¿Están activos los servicios?");
        } finally {
            setLoading(false);
        }
    }, [user?.token, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCrearPregunta = async (values, { resetForm, setSubmitting }) => {
        setLoading(true);
        setSubmitting(true);

        try {
            const palabraSeleccionada = palabras.find(p => p.idPalabra === values.idPalabra);
            if (!palabraSeleccionada) {
                throw new Error("La palabra seleccionada no es válida.");
            }

            const respuestaCorrecta = palabraSeleccionada.palabraNasa;
            const opciones = [values.opcion1, values.opcion2, values.opcion3, values.opcion4];
            if (!opciones.includes(respuestaCorrecta)) {
                throw new Error("La respuesta correcta (traducción de la palabra) debe ser una de las cuatro opciones.");
            }

            const payload = {
                ...values,
                respuestaCoreccta: respuestaCorrecta,
                imagenUrl: values.tipo_pregunta === 'imagen' ? palabraSeleccionada.imagenUrl : null,
                audio_url: values.tipo_pregunta === 'audio' ? palabraSeleccionada.audioUrl : null,
            };

            await crearPregunta(payload);
            addToast('success', "Pregunta creada con éxito.");
            resetForm();
            fetchData();
        } catch (error) {
            addToast('error', `Error al crear la pregunta: ${error.message}`);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleUpdatePregunta = async (values, { setSubmitting }) => {
        setLoading(true);
        setSubmitting(true);

        try {
            const palabraSeleccionada = palabras.find(p => p.idPalabra === values.idPalabra);
            if (!palabraSeleccionada) {
                throw new Error("La palabra seleccionada no es válida.");
            }

            const respuestaCorrecta = palabraSeleccionada.palabraNasa;
            const opciones = [values.opcion1, values.opcion2, values.opcion3, values.opcion4];
            if (!opciones.includes(respuestaCorrecta)) {
                throw new Error("La respuesta correcta (traducción de la palabra) debe ser una de las cuatro opciones.");
            }

            const payload = {
                ...values,
                respuestaCoreccta: respuestaCorrecta,
                imagenUrl: values.tipo_pregunta === 'imagen' ? palabraSeleccionada.imagenUrl : null,
                audio_url: values.tipo_pregunta === 'audio' ? palabraSeleccionada.audioUrl : null,
                nivel: { idNivel: values.idNivel },
                palabra: values.idPalabra ? { idPalabra: values.idPalabra } : null
            };
            await actualizarPregunta(values.idPregunta, payload);
            addToast('success', "Pregunta actualizada con éxito.");
            setShowEditModal(false);
            setCurrentEditPregunta(null);
            fetchData();
        } catch (error) {
            addToast('error', `Error al actualizar la pregunta: ${error.message}`);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleEliminarPregunta = async (id) => {
        setLoading(true);
        try {
            await eliminarPregunta(preguntaToDelete.idPregunta);
            addToast('success', "Pregunta eliminada correctamente.");
            setPreguntaToDelete(null);
            fetchData();
        } catch (error) {
            addToast('error', `Error al eliminar la pregunta: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (pregunta) => {
        const tipoPreguntaActual = pregunta.imagenUrl ? 'imagen' : (pregunta.audio_url ? 'audio' : '');
        const mediaUrlActual = pregunta.imagenUrl || pregunta.audio_url || '';

        const initialValues = {
            ...pregunta,
            idNivel: pregunta.nivel?.idNivel || '',
            idPalabra: pregunta.palabra?.idPalabra || '',
            tipo_pregunta: tipoPreguntaActual,
            mediaUrl: mediaUrlActual
        };
        setCurrentEditPregunta(initialValues);
        setShowEditModal(true);
    };

    const FormularioPregunta = ({ isSubmitting, values, errors, touched, setFieldValue, isEditMode = false }) => {
        const palabraOptions = palabras.map(p => ({ value: p.idPalabra, label: p.palabraNasa, frase: p.fraseEjemplo, traduccion: p.traduccion }));
        const palabraOptionsForSelect = palabras.map(p => ({ value: p.palabraNasa, label: p.palabraNasa }));
        const handlePalabraCorrectaChange = (option) => {
            setFieldValue('idPalabra', option.value);
            setFieldValue('preguntaTexto', option.frase);
            setFieldValue('opcion1', option.label); // Usamos 'label' que es 'palabraNasa'
            if (!isEditMode) {
                setFieldValue('opcion2', '');
                setFieldValue('opcion3', '');
                setFieldValue('opcion4', '');
            }
        };

        const palabraSeleccionada = palabraOptions.find(p => p.value === values.idPalabra);

        const getMediaUrl = (tipo) => {
            if (!palabraSeleccionada) return null;
            return tipo === 'imagen' ? palabras.find(p => p.idPalabra === palabraSeleccionada.value)?.imagenUrl : palabras.find(p => p.idPalabra === palabraSeleccionada.value)?.audioUrl;
        };

        return (
            <Form>
                <div className="mb-3">
                    <label>Palabra Correcta (Esta selección generará la pregunta)</label>
                    <Select
                        options={palabraOptions}
                        onChange={handlePalabraCorrectaChange}
                        placeholder="Busque y seleccione una palabra..."
                        value={palabraOptions.find(p => p.value === values.idPalabra) || null}
                    />
                    <ErrorMessage name="idPalabra" component="div" className="text-danger" />
                </div>

                <div className="mb-3">
                    <label>Texto de la Pregunta (autogenerado)</label>
                    <Field name="preguntaTexto" as="textarea" readOnly className="form-control-plaintext" />
                    <ErrorMessage name="preguntaTexto" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                    <label>Tipo de Pregunta</label>
                    <Field as="select" name="tipo_pregunta" className={`form-select ${errors.tipo_pregunta && touched.tipo_pregunta ? 'is-invalid' : ''}`}>
                        <option value="">Seleccione el tipo...</option>
                        <option value="imagen">Adivinar por Imagen</option>
                        <option value="audio">Adivinar por Audio</option>
                    </Field>
                    <ErrorMessage name="tipo_pregunta" component="div" className="invalid-feedback" />
                    {values.tipo_pregunta && palabraSeleccionada && (
                        <div className="mt-2 small text-muted">
                            URL a usar: <a href={getMediaUrl(values.tipo_pregunta)} target="_blank" rel="noopener noreferrer">
                                {getMediaUrl(values.tipo_pregunta) || 'No disponible'}
                            </a>
                        </div>
                    )}
                    {!isSubmitting && values.tipo_pregunta === 'imagen' && values.mediaUrl && (
                        <div className="mt-2">
                            <p className="mb-1 small">Imagen actual:</p>
                            <img src={values.mediaUrl} alt="Vista previa" className="img-thumbnail" style={{ maxWidth: '150px', maxHeight: '150px' }} />
                        </div>
                    )}
                    {!isSubmitting && values.tipo_pregunta === 'audio' && values.mediaUrl && (
                        <div className="mt-2">
                            <p className="mb-1 small">Audio actual:</p>
                            <audio controls src={values.mediaUrl} className="w-100">
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>Opción 1</label>
                        <Select
                            options={palabraOptionsForSelect}
                            onChange={option => setFieldValue('opcion1', option.value)}
                            onInputChange={inputValue => { /* Permite escribir */ }}
                            value={palabraOptionsForSelect.find(p => p.value === values.opcion1) || null}
                            placeholder="Escriba o seleccione..."
                        />
                        <ErrorMessage name="opcion1" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Opción 2</label>
                        <Select
                            options={palabraOptionsForSelect}
                            onChange={option => setFieldValue('opcion2', option.value)}
                            onInputChange={inputValue => { /* Permite escribir */ }}
                            value={palabraOptionsForSelect.find(p => p.value === values.opcion2) || null}
                            placeholder="Escriba o seleccione..."
                        />
                        <ErrorMessage name="opcion2" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Opción 3</label>
                        <Select
                            options={palabraOptionsForSelect}
                            onChange={option => setFieldValue('opcion3', option.value)}
                            onInputChange={inputValue => { /* Permite escribir */ }}
                            value={palabraOptionsForSelect.find(p => p.value === values.opcion3) || null}
                            placeholder="Escriba o seleccione..."
                        />
                        <ErrorMessage name="opcion3" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Opción 4</label>
                        <Select
                            options={palabraOptionsForSelect}
                            onChange={option => setFieldValue('opcion4', option.value)}
                            onInputChange={inputValue => { /* Permite escribir */ }}
                            value={palabraOptionsForSelect.find(p => p.value === values.opcion4) || null}
                            placeholder="Escriba o seleccione..."
                        />
                        <ErrorMessage name="opcion4" component="div" className="text-danger" />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>XP</label>
                        <Field name="xpValor" type="number" min="0" className={`form-control ${errors.xpValor && touched.xpValor ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="xpValor" component="div" className="invalid-feedback" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Nivel</label>
                        <Field as="select" name="idNivel" className={`form-select ${errors.idNivel && touched.idNivel ? 'is-invalid' : ''}`}>
                            <option value="">Seleccione un nivel</option>
                            {niveles.map(n => <option key={n.idNivel} value={n.idNivel}>{n.nombre}</option>)}
                        </Field>
                        <ErrorMessage name="idNivel" component="div" className="invalid-feedback" />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
            </Form>
        );
    };

    const EditModal = () => {
        if (!showEditModal || !currentEditPregunta) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Pregunta ID: {currentEditPregunta.idPregunta}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <Formik
                            initialValues={currentEditPregunta}
                            validationSchema={PreguntaSchema}
                            onSubmit={handleUpdatePregunta}
                            enableReinitialize
                        > 
                            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                                <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    <FormularioPregunta isSubmitting={isSubmitting} values={values} errors={errors} touched={touched} setFieldValue={setFieldValue} />
                                </div>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        );
    };

    const ConfirmDeleteModal = () => {
        if (!preguntaToDelete) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="btn-close" onClick={() => setPreguntaToDelete(null)}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres eliminar la pregunta "<strong>{preguntaToDelete.preguntaTexto}</strong>"?</p>
                            <p className="text-danger">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setPreguntaToDelete(null)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleEliminarPregunta} disabled={loading}>
                                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PreviewCardModal = () => {
        if (!showPreviewModal || !currentPreviewPregunta) return null;

        const getOpcionClass = (opcion) => {
            return opcion === currentPreviewPregunta.respuestaCoreccta ? 'list-group-item list-group-item-success' : 'list-group-item';
        };

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Vista Completa de Pregunta</h5>
                            <button type="button" className="btn-close" onClick={() => setShowPreviewModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="card shadow-sm h-100">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">{currentPreviewPregunta.preguntaTexto}</h5>
                                </div>
                                <div className="card-body">
                                    <ul className="list-group list-group-flush">
                                        <li className={getOpcionClass(currentPreviewPregunta.opcion1)}>{currentPreviewPregunta.opcion1}</li>
                                        <li className={getOpcionClass(currentPreviewPregunta.opcion2)}>{currentPreviewPregunta.opcion2}</li>
                                        <li className={getOpcionClass(currentPreviewPregunta.opcion3)}>{currentPreviewPregunta.opcion3}</li>
                                        <li className={getOpcionClass(currentPreviewPregunta.opcion4)}>{currentPreviewPregunta.opcion4}</li>
                                    </ul>
                                    <p className="card-text mt-3">
                                        <small className="text-muted">
                                            Nivel: {currentPreviewPregunta.nivel?.nombre || 'N/A'} | XP: {currentPreviewPregunta.xpValor} | Palabra: {currentPreviewPregunta.palabra?.palabraNasa || 'N/A'}
                                        </small>
                                    </p>
                                </div>
                                <div className="card-footer bg-transparent border-top-0 pb-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">ID: {currentPreviewPregunta.idPregunta}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) return <p className="alert alert-danger">❌ **Acceso denegado:** Debes iniciar sesión para administrar.</p>;

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentPreguntas = preguntas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(preguntas.length / ITEMS_PER_PAGE);
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleOpenPreviewModal = (pregunta) => { setCurrentPreviewPregunta(pregunta); setShowPreviewModal(true); };

    return (
        <div className="admin-page bg-light flex-grow-1">
            <div className="container py-4">
                <h1>Administración de Preguntas</h1>

                {loading && <Loader />}

                <div className="row mt-4">
                    <div className="col-lg-5 mb-4 mb-lg-0">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Crear Nueva Pregunta</h2>
                            <Formik
                                initialValues={{
                                    idPalabra: '',
                                    preguntaTexto: '',
                                    tipo_pregunta: '',
                                    opcion1: '',
                                    opcion2: '',
                                    opcion3: '',
                                    opcion4: '',
                                    xpValor: 10,
                                    idNivel: ''
                                }}
                                validationSchema={PreguntaSchema}
                                onSubmit={handleCrearPregunta}
                            >
                                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                                    <FormularioPregunta isSubmitting={isSubmitting} values={values} errors={errors} touched={touched} setFieldValue={setFieldValue} />
                                )}
                            </Formik>
                        </section>
                    </div>

                    <div className="col-lg-7">
                        <section className="p-4 border rounded shadow-sm bg-white h-100 d-flex flex-column">
                            <h2>Listado de Preguntas</h2>
                            <div className="row row-cols-1 g-4 flex-grow-1 overflow-auto">
                                {preguntas.length > 0 ? (
                                    currentPreguntas.map((pregunta) => (
                                        <AdminPreguntaCard
                                            key={pregunta.idPregunta}
                                            pregunta={pregunta}
                                            onEdit={handleOpenEditModal}
                                            onDelete={setPreguntaToDelete}
                                            onPreview={handleOpenPreviewModal}
                                            loading={loading}
                                        />
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <p className="text-center text-muted mt-4">
                                            No hay preguntas para mostrar.
                                        </p>
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
            </div>

            <EditModal />
            <ConfirmDeleteModal />
            <PreviewCardModal /> 
        </div>
    );
};

export default AdminPreguntasPage;