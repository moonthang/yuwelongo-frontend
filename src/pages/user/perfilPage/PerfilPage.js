import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/ui/Loader/Loader';
import { Button } from '../../../components/ui/Button/Button';
import {
    obtenerUsuarioPorId,
    obtenerUsuarioPorCorreo,
    actualizarUsuario,
} from '../../../services/userService';
import './PerfilPage.css';

export default function PerfilPage() {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ nombre: '', correo: '', rol: '', contrasena: '' });

    useEffect(() => {
        let mounted = true;

        async function fetchProfile() {
            setLoading(true);
            try {
                if (user && user.idUsuario) {
                    const data = await obtenerUsuarioPorId(user.idUsuario);
                    if (!mounted) return;
                    setProfile(data);
                    setForm({
                        nombre: data.nombre || '',
                        correo: data.correo || '',
                        rol: data.rol || '',
                        contrasena: '',
                    });
                } else if (user && user.correo) {
                    const result = await obtenerUsuarioPorCorreo(user.correo);
                    const data = Array.isArray(result) ? result[0] : result;
                    if (!mounted) return;
                    setProfile(data);
                    setForm({
                        nombre: data.nombre || '',
                        correo: data.correo || '',
                        rol: data.rol || '',
                        contrasena: '',
                    });
                } else if (user) {
                    setProfile(user);
                    setForm({
                        nombre: user.nombre || '',
                        correo: user.correo || '',
                        rol: user.rol || '',
                        contrasena: '',
                    });
                }
            } catch (error) {
                addToast('error', error.message || 'No se pudo cargar el perfil.');
                if (user) {
                    setProfile(user);
                    setForm({
                        nombre: user.nombre || '',
                        correo: user.correo || '',
                        rol: user.rol || '',
                        contrasena: '',
                    });
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchProfile();

        return () => { mounted = false; };
    }, [user, addToast]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function validate() {
        if (!form.nombre || form.nombre.trim() === '') {
            addToast('error', 'El nombre es obligatorio.');
            return false;
        }
        if (!form.correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo)) {
            addToast('error', 'Ingrese un correo válido.');
            return false;
        }
        return true;
    }

    async function handleSave() {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = { ...profile, nombre: form.nombre, correo: form.correo };
            payload.rol = profile.rol;
            if (form.contrasena && form.contrasena.trim() !== '') {
                payload.contrasena = form.contrasena;
            }

            const data = await actualizarUsuario(payload);
            setProfile(data);
            setForm(prev => ({ ...prev, contrasena: '' }));
            setEditing(false);
            addToast('success', data.mensaje || 'Perfil actualizado con éxito.');
            if (data.nombre) sessionStorage.setItem('nombre', data.nombre);
            if (data.correo) sessionStorage.setItem('correo', data.correo);
            if (setUser) {
                const merged = { ...(user || {}), ...data };
                setUser(merged);
            }
        } catch (error) {
            addToast('error', error.message || 'Error al guardar el perfil.');
        } finally {
            setLoading(false);
        }
    }

    if (loading && !profile) return <div className="perfil-page-wrapper"><Loader /></div>;

    return (
        <div className="perfil-page bg-light">
            <div className="container py-4">
                <h1 className="mb-4 text-center">Mi Perfil</h1>

                {loading && <Loader />}

                <div className="perfil-card p-4 bg-white rounded shadow-sm">
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            name="nombre"
                            type="text"
                            className="form-control"
                            value={form.nombre}
                            onChange={handleChange}
                            disabled={!editing}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Correo</label>
                        <input
                            name="correo"
                            type="email"
                            className="form-control"
                            value={form.correo}
                            onChange={handleChange}
                            disabled={!editing}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña (dejar vacío para no cambiar)</label>
                        <input
                            name="contrasena"
                            type="password"
                            className="form-control"
                            value={form.contrasena}
                            onChange={handleChange}
                            disabled={!editing}
                        />
                    </div>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                        {!editing ? (
                            <Button variant="primary" onClick={() => setEditing(true)}>Editar</Button>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={() => { setEditing(false); setForm({ nombre: profile.nombre || '', correo: profile.correo || '', rol: profile.rol || '', contrasena: '' }); }}>Cancelar</Button>
                                <Button variant="success" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}