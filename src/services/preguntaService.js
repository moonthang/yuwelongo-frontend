import { fetchWithAuth } from "../context/api";

export async function obtenerPreguntas() {
    const res = await fetchWithAuth('/preguntas-juego');
    if (!res.ok) throw new Error("Error al obtener las preguntas");
    return res.json();
}

export async function obtenerPreguntaPorId(id) {
    const res = await fetchWithAuth(`/preguntas-juego/${id}`);
    if (!res.ok) throw new Error("Error al buscar la pregunta");
    return res.json();
}

export async function obtenerPreguntasPorNivel(idNivel, { aleatorias = false, cantidad = 10 } = {}) {
    const url = `/preguntas-juego/nivel/${idNivel}?aleatorias=${aleatorias}&cantidad=${cantidad}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) {
        if (res.status === 404) {
            return [];
        }
        throw new Error("Error al obtener las preguntas por nivel");
    }
    return res.json();
}

export async function crearPregunta(data) {
    const payload = {
        ...data,
        nivel: { idNivel: data.idNivel },
        palabra: data.idPalabra ? { idPalabra: data.idPalabra } : null
    };
    delete payload.idNivel;
    delete payload.idPalabra;

    const res = await fetchWithAuth('/preguntas-juego', {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear la pregunta");
    return res.json();
}

export async function actualizarPregunta(id, data) {
    const res = await fetchWithAuth(`/preguntas-juego/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar la pregunta");
    return res.json();
}

export async function eliminarPregunta(id) {
    const res = await fetchWithAuth(`/preguntas-juego/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar la pregunta");
    return { success: true, message: "Pregunta eliminada correctamente" };
}