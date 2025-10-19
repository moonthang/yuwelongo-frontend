import { API_URL } from "../config";

export async function getCategorias(token) {
    const res = await fetch(`${API_URL}/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener categorías");
    return res.json();
}

export async function buscarCategoria(nombre, token) {
    const res = await fetch(`${API_URL}/categorias?nombre=${encodeURIComponent(nombre)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al buscar categoría");
    return res.json();
}

export async function crearCategoria(data, token) {
    const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear categoría");
    return res.json();
}

export async function eliminarCategoria(id, token) {
    const res = await fetch(`${API_URL}/categorias?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar categoría");
    return res.json();
}