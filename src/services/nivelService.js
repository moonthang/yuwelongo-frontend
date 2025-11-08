import { fetchWithAuth } from "../context/api";

export async function obtenerNiveles() {
    const res = await fetchWithAuth('/niveles-juego');
    if (!res.ok) throw new Error("Error al obtener los niveles de juego");
    return res.json();
}

export async function obtenerNivelPorId(id) {
    const res = await fetchWithAuth(`/niveles-juego/${id}`);
    if (!res.ok) throw new Error("Error al buscar el nivel de juego");
    return res.json();
}

export async function crearNivel(data) {
    const res = await fetchWithAuth('/niveles-juego', {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear el nivel de juego");
    return res.json();
}

export async function actualizarNivel(id, data) {
    const res = await fetchWithAuth(`/niveles-juego/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el nivel de juego");
    return res.json();
}

export async function eliminarNivel(id) {
    const res = await fetchWithAuth(`/niveles-juego/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar el nivel de juego");
    return { success: true, message: "Nivel de juego eliminado correctamente" };
}