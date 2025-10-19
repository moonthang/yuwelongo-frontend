import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
    crearUsuario,
    getUsuarios,
    getUsuarioById,
    getUsuarioByCorreo,
    deleteUsuario,
    updateUsuario
} from '../../services/userService';

const CrearUsuarioSchema = Yup.object().shape({
    nombre: Yup.string()
        .required('El nombre es obligatorio'),
    correo: Yup.string()
        .email('Formato de correo inválido')
        .required('El correo es obligatorio'),
    contrasena: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es obligatoria'),
    rol: Yup.string()
        .oneOf(['ADMIN', 'USUARIO'])
        .required('El rol es obligatorio'),
});

const EditarUsuarioSchema = Yup.object().shape({
    idUsuario: Yup.number().required(),
    nombre: Yup.string().required('El nombre es obligatorio'),
    correo: Yup.string().email('Formato de correo inválido').required('El correo es obligatorio'),
    rol: Yup.string().oneOf(['ADMIN', 'USUARIO']).required('El rol es obligatorio'),
    contrasena: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').nullable(),
});

const AdminUsersPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('id');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);

    const fetchUsuarios = async () => {
        setLoading(true);
        setMensaje(null);
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            setMensaje({ type: 'error', text: error.message });
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleCrearUsuario = async (values, { resetForm }) => {
        setLoading(true);
        setMensaje(null);
        try {
            const data = await crearUsuario(values);
            setMensaje({ type: 'success', text: data.mensaje });
            resetForm();
            fetchUsuarios();
        } catch (error) {
            setMensaje({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!searchTerm) {
            fetchUsuarios();
            return;
        }

        setLoading(true);
        setMensaje(null);
        try {
            let result;
            if (searchType === 'id') {
                const id = parseInt(searchTerm);
                if (isNaN(id)) throw new Error("El ID debe ser un número.");
                result = await getUsuarioById(id);
            } else {
                result = await getUsuarioByCorreo(searchTerm);
            }

            setUsuarios(Array.isArray(result) ? result : [result]);
            setMensaje({ type: 'info', text: `Resultados encontrados para: ${searchTerm}` });

        } catch (error) {
            setMensaje({ type: 'error', text: error.message });
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${id}?`)) {
            return;
        }

        setLoading(true);
        setMensaje(null);
        try {
            const data = await deleteUsuario(id);
            setMensaje({ type: 'success', text: data.mensaje });
            fetchUsuarios();
        } catch (error) {
            setMensaje({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (user) => {
        setCurrentEditUser({
            idUsuario: user.idUsuario,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol,
            contrasena: '',
        });
        setShowEditModal(true);
    };

    const handleUpdateUsuario = async (values, { setSubmitting }) => {
        setSubmitting(true);
        setMensaje(null);

        if (values.contrasena === '') {
            delete values.contrasena;
        }

        try {
            const data = await updateUsuario(values);
            setMensaje({ type: 'success', text: data.mensaje });
            setShowEditModal(false);
            fetchUsuarios();
        } catch (error) {
            setMensaje({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const EditUserModal = () => {
        if (!showEditModal || !currentEditUser) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Usuario ID: {currentEditUser.idUsuario}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <Formik
                            initialValues={currentEditUser}
                            validationSchema={EditarUsuarioSchema}
                            onSubmit={handleUpdateUsuario}
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
                                            <label htmlFor="editCorreo" className="form-label">Correo</label>
                                            <Field name="correo" type="email" id="editCorreo" className={`form-control ${errors.correo && touched.correo ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="correo" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editRol" className="form-label">Rol</label>
                                            <Field as="select" name="rol" id="editRol" className="form-control">
                                                <option value="USUARIO">USUARIO</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </Field>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editContrasena" className="form-label">Contraseña (Dejar vacío para no cambiar)</label>
                                            <Field name="contrasena" type="password" id="editContrasena" className={`form-control ${errors.contrasena && touched.contrasena ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="contrasena" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cerrar</button>
                                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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

    return (
        <div className="admin-users-page container">
            <h1>Administración de Usuarios</h1>

            {mensaje && (
                <div className={`alert alert-${mensaje.type} mt-3`}>
                    {mensaje.text}
                </div>
            )}

            {loading && <p>Cargando...</p>}

            {/* CREAR USUARIO */}
            <section className="mt-4 p-4 border rounded shadow-sm bg-light">
                <h2>Crear Nuevo Usuario (Admin)</h2>
                <Formik
                    initialValues={{ nombre: '', correo: '', contrasena: '', rol: 'USUARIO' }}
                    validationSchema={CrearUsuarioSchema}
                    onSubmit={handleCrearUsuario}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="nombre">Nombre</label>
                                    <Field name="nombre" type="text" className={`form-control ${errors.nombre && touched.nombre ? 'is-invalid' : ''}`} />
                                    <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="correo">Correo</label>
                                    <Field name="correo" type="email" className={`form-control ${errors.correo && touched.correo ? 'is-invalid' : ''}`} />
                                    <ErrorMessage name="correo" component="div" className="invalid-feedback" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="contrasena">Contraseña</label>
                                    <Field name="contrasena" type="password" className={`form-control ${errors.contrasena && touched.contrasena ? 'is-invalid' : ''}`} />
                                    <ErrorMessage name="contrasena" component="div" className="invalid-feedback" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="rol">Rol</label>
                                    <Field as="select" name="rol" className="form-control">
                                        <option value="USUARIO">USUARIO</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </Field>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </section>

            {/* BUSCADOR Y LISTA */}
            <section className="mt-5 p-4 border rounded shadow-sm bg-light">
                <h2>Buscar y Listar Usuarios</h2>
                <form onSubmit={handleBuscar} className="mb-4 d-flex">
                    <select
                        className="form-select me-2"
                        style={{ width: '150px' }}
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="id">Buscar por ID</option>
                        <option value="correo">Buscar por Correo</option>
                    </select>
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder={`Ingrese ${searchType === 'id' ? 'ID' : 'Correo'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-info me-2" disabled={loading}>
                        Buscar
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={fetchUsuarios} disabled={loading}>
                        Ver Todos
                    </button>
                </form>

                {/* TABLA DE USUARIOS */}
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length > 0 ? (
                                usuarios.map((u) => (
                                    <tr key={u.idUsuario}>
                                        <td>{u.idUsuario}</td>
                                        <td>{u.nombre}</td>
                                        <td>{u.correo}</td>
                                        <td>{u.rol}</td>
                                        <td>{u.estado}</td>
                                        <td>{u.fechaRegistro}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleOpenEditModal(u)}
                                                disabled={loading}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleEliminar(u.idUsuario)}
                                                disabled={loading}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">No hay usuarios para mostrar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* MODAL DE EDICIÓN */}
            <EditUserModal />
        </div>
    );
};

export default AdminUsersPage;