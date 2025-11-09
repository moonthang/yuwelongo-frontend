import { fetchWithAuth } from "../context/api";
import { subirArchivo } from "./mediaService";

export async function obtenerCategorias() {
    const res = await fetchWithAuth('/categorias');
    if (!res.ok) throw new Error("Error al obtener categorías");
    return res.json();
}

export async function buscarCategoriaPorId(id) {
    const res = await fetchWithAuth(`/categorias/${id}`);
    if (!res.ok) throw new Error("Error al buscar la categoría por ID");
    return res.json();
}

export async function buscarCategoria(nombre) {
    const res = await fetchWithAuth(`/categorias?nombre=${encodeURIComponent(nombre)}`);
    if (!res.ok) throw new Error("Error al buscar categoría");
    return res.json();
}

export async function crearCategoria(data) {
    let categoriaData = { ...data };

    if (data.imagenFile && data.imagenFile instanceof File) {
        const uploadResult = await subirArchivo(data.imagenFile, "categorias");
        
        categoriaData.imagenUrl = uploadResult.url;
        delete categoriaData.imagenFile;
    }

    const res = await fetchWithAuth('/categorias', {
        method: "POST",
        body: JSON.stringify(categoriaData),
    });
    if (!res.ok) throw new Error("Error al crear categoría");
    return res.json();
}

export async function eliminarCategoria(id) {
    const res = await fetchWithAuth(`/categorias/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar categoría");
    return res.json();
}

export async function actualizarCategoria(data) {
    let categoriaData = { ...data };

    if (data.imagenFile && data.imagenFile instanceof File) {
        const uploadResult = await subirArchivo(data.imagenFile, "categorias");

        categoriaData.imagenUrl = uploadResult.url;
        delete categoriaData.imagenFile;
    }

    const res = await fetchWithAuth('/categorias', { 
        method: "PUT", 
        body: JSON.stringify(categoriaData),
    });
    if (!res.ok) throw new Error("Error al actualizar categoría");
    return res.json(); 
}