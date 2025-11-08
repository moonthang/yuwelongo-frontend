import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorCorreo,
    eliminarUsuario,
    actualizarUsuario
} from '../../../services/userService';
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';
import { Button } from '../../../components/ui/Button/Button';

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
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('id');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (error) {
            addToast('error', error.message || 'Error al obtener los usuarios.');
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handleCrearUsuario = async (values, { resetForm }) => {
        setLoading(true);
        try {
            const data = await crearUsuario(values);
            addToast('success', data.mensaje || "Usuario creado con éxito.");
            resetForm();
            fetchUsuarios();
        } catch (error) {
            addToast('error', error.message);
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
        try {
            let result;
            if (searchType === 'id') {
                const id = parseInt(searchTerm);
                if (isNaN(id)) throw new Error("El ID debe ser un número.");
                result = await obtenerUsuarioPorId(id);
            } else {
                result = await obtenerUsuarioPorCorreo(searchTerm);
            }

            setUsuarios(Array.isArray(result) ? result : [result]);
            addToast('info', `Resultados encontrados para: ${searchTerm}`);
        } catch (error) {
            addToast('error', error.message);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarDelete = async () => {
        if (!userToDelete) return;
        setLoading(true);
        try {
            const data = await eliminarUsuario(userToDelete.idUsuario);
            addToast('success', data.mensaje || "Usuario eliminado con éxito.");
            setUserToDelete(null);
            fetchUsuarios();
        } catch (error) {
            addToast('error', error.message);
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

    const handleActualizarUsuario = async (values, { setSubmitting }) => {
        setSubmitting(true);

        if (values.contrasena === '') {
            delete values.contrasena;
        }

        try {
            const data = await actualizarUsuario(values);
            addToast('success', data.mensaje || "Usuario actualizado con éxito.");
            setShowEditModal(false);
            fetchUsuarios();
        } catch (error) {
            addToast('error', error.message);
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
                            onSubmit={handleActualizarUsuario}
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
                                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cerrar</Button>
                                        <Button type="submit" variant="success" disabled={isSubmitting}>
                                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
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
        if (!userToDelete) return null;

        return (
            <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="btn-close" onClick={() => setUserToDelete(null)}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres eliminar al usuario "<strong>{userToDelete.nombre}</strong>" (ID: {userToDelete.idUsuario})?</p>
                            <p className="text-danger">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setUserToDelete(null)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleConfirmarDelete} disabled={loading}>
                                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="admin-users-page bg-light flex-grow-1">
            <div className="container py-4">
                <h1>Administración de Usuarios</h1>

                {loading && <Loader />}

                <div className="row admin-users-content mt-4">
                    <div className="col-md-4 col-lg-4 mb-4 mb-md-0">
                        <section className="p-4 border rounded shadow-sm bg-white">
                            <h2>Crear Nuevo Usuario</h2>
                            <Formik
                                initialValues={{ nombre: '', correo: '', contrasena: '', rol: 'USUARIO' }}
                                validationSchema={CrearUsuarioSchema}
                                onSubmit={handleCrearUsuario}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <div className="mb-3">
                                            <label htmlFor="nombre">Nombre</label>
                                            <Field name="nombre" type="text" className={`form-control ${errors.nombre && touched.nombre ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="correo">Correo</label>
                                            <Field name="correo" type="email" className={`form-control ${errors.correo && touched.correo ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="correo" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="contrasena">Contraseña</label>
                                            <Field name="contrasena" type="password" className={`form-control ${errors.contrasena && touched.contrasena ? 'is-invalid' : ''}`} />
                                            <ErrorMessage name="contrasena" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="rol">Rol</label>
                                            <Field as="select" name="rol" className="form-control">
                                                <option value="USUARIO">USUARIO</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </Field>
                                        </div>
                                        <Button type="submit" variant="success" disabled={loading}>
                                            {loading ? 'Creando...' : 'Crear Usuario'}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </section>
                    </div>

                    <div className="col-md-7 col-lg-8">
                        <section className="p-4 border rounded shadow-sm bg-white h-100">
                            <h2>Buscar y Listar Usuarios</h2>
                            <form onSubmit={handleBuscar} className="mb-4 d-flex">
                                <select
                                    className="form-select me-2"
                                    style={{ width: '150px' }}
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                >
                                    <option value="id">Buscar ID</option>
                                    <option value="correo">Buscar Correo</option>
                                </select>
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder={`Ingrese ${searchType === 'id' ? 'ID' : 'Correo'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button type="submit" variant="primary" className="me-2" disabled={loading} title="Buscar">
                                    <i className="bi bi-search"></i>
                                </Button>
                                <Button type="button" variant="secondary" onClick={fetchUsuarios} disabled={loading} title="Ver Todos">
                                    Todos
                                </Button>
                            </form>

                            <div className="table-responsive rounded">
                                <table className="table">
                                    <thead className="table-light">
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
                                                <tr key={u.idUsuario} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                    <td style={{ borderBottom: 'none' }}>{u.idUsuario}</td>
                                                    <td style={{ borderBottom: 'none' }}>{u.nombre}</td>
                                                    <td style={{ borderBottom: 'none' }}>{u.correo}</td>
                                                    <td style={{ borderBottom: 'none' }}>{u.rol}</td>
                                                    <td style={{ borderBottom: 'none' }}>{u.estado}</td>
                                                    <td style={{ borderBottom: 'none' }}>{u.fechaRegistro}</td>
                                                    <td style={{ borderBottom: 'none' }}>
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <Button
                                                                className="btn btn-link text-warning p-0"
                                                                onClick={() => handleOpenEditModal(u)}
                                                                disabled={loading}
                                                                title="Editar"
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </Button>
                                                            <Button
                                                                className="btn btn-link text-danger p-0"
                                                                onClick={() => setUserToDelete(u)}
                                                                disabled={loading}
                                                                title="Eliminar"
                                                            >
                                                                <i className="bi bi-trash-fill"></i>
                                                            </Button>
                                                        </div>

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
                    </div>
                </div>
            </div>
            <>
                <EditUserModal />
                <ConfirmDeleteModal />
            </>
        </div>
    );
};

export default AdminUsersPage;