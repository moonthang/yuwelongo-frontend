import { fetchWithAuth } from "../context/api";

export async function obtenerPalabras() {
    const res = await fetchWithAuth('/palabras');
    if (!res.ok) throw new Error("Error al obtener palabras");
    return res.json();
}

export async function buscarPalabra(query, tipo) {
    const url = `/palabras?${tipo}=${encodeURIComponent(query)}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error("Error al buscar palabra");
    return res.json();
}

export async function crearPalabra(data) {
    const { idCategoria, ...palabraData } = data;
    const url = `/palabras?idCategoria=${idCategoria}`;

    const res = await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(palabraData),
    });
    if (!res.ok) throw new Error("Error al crear palabra");
    return res.json();
}

export async function actualizarPalabra(data) {
    if (!data.idPalabra) {
        throw new Error("El ID de la palabra es requerido para actualizar.");
    }
    const { idCategoria, ...palabraData } = data;
    const url = `/palabras?idCategoria=${idCategoria}`;
    
    const res = await fetchWithAuth(url, {
        method: "PUT",
        body: JSON.stringify(palabraData),
    });
    if (!res.ok) throw new Error("Error al actualizar la palabra");
    return res.json();
}

export async function eliminarPalabra(id) {
    const res = await fetchWithAuth(`/palabras/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar la palabra");
    return res.json();
}