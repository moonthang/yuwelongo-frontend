import { API_URL } from "../config";

export async function getPalabras(token) {
    const res = await fetch(`${API_URL}/palabras`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener palabras");
    return res.json();
}

export async function buscarPalabra(query, tipo, token) {
    const url = `${API_URL}/palabras?${tipo}=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Error al buscar palabra");
    return res.json();
}

export async function crearPalabra(data, token) {
    const res = await fetch(`${API_URL}/palabras`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear palabra");
    return res.json();
}

export async function actualizarPalabra(data, token) {
    if (!data.id) {
        throw new Error("El ID de la palabra es requerido para actualizar.");
    }
    const res = await fetch(`${API_URL}/palabras`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar la palabra");
    return res.json();
}

export async function eliminarPalabra(id, token) {    
    const res = await fetch(`${API_URL}/palabras?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar palabra");
    return { success: true, message: "Palabra eliminada correctamente" };
}