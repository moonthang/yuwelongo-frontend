import { fetchWithAuth } from "../context/api";

export async function agregarFavorito(idUsuario, idPalabra) {
    const url = `/favoritos?idUsuario=${idUsuario}&idPalabra=${idPalabra}`;
    const res = await fetchWithAuth(url, {
        method: "POST",
    });
    return res.json();
}

export async function eliminarFavorito(idFavorito) {
    const res = await fetchWithAuth(`/favoritos/${idFavorito}`, {
        method: "DELETE",
    });
    if (res.status === 204 || res.status === 200) {
        return { success: true, message: "Favorito eliminado" };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Error al eliminar el favorito");
    return data;
}

export async function obtenerFavoritosPorUsuario(idUsuario) {
    const res = await fetchWithAuth(`/favoritos/usuario/${idUsuario}`);
    if (res.status === 404) {
        return [];
    }
    if (!res.ok) {
        throw new Error("Error al obtener los favoritos del usuario");
    }
    return res.json();
}