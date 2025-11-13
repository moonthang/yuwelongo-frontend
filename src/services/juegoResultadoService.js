import { fetchWithAuth } from "../context/api";

const BASE_URL = '/juegos';

export async function guardarResultado(data) {
    const res = await fetchWithAuth(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar el resultado del juego");
    return res.json();
}

export async function actualizarResultado(id, data) {
    const res = await fetchWithAuth(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el resultado del juego");
    return res.json();
}

export async function obtenerHistorialPorUsuario(idUsuario) {
    const res = await fetchWithAuth(`${BASE_URL}/historial/${idUsuario}`);
    if (!res.ok) throw new Error("Error al obtener el historial del usuario");
    return res.json();
}

export async function obtenerMejoresPuntajesPorNivel(idNivel, limite = 10) {
    const res = await fetchWithAuth(`${BASE_URL}/mejores/${idNivel}?limite=${limite}`);
    if (!res.ok) throw new Error("Error al obtener el ranking por nivel");
    return res.json();
}

export async function obtenerPuntajeTotalUsuario(idUsuario) {
    const res = await fetchWithAuth(`${BASE_URL}/total/${idUsuario}`);
    if (!res.ok) throw new Error("Error al obtener el puntaje total del usuario");
    return res.json();
}

export async function obtenerRankingGlobal(params) {
    let url = `${BASE_URL}/ranking`;

    if (typeof params === 'object' && params.idPartida) {
        url = `${BASE_URL}/ranking/${params.idPartida}`;
    } else if (typeof params === 'number') {
        url = `${BASE_URL}/ranking?limite=${params}`;
    }

    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error("Error al obtener el ranking global");
    return res.json();
}