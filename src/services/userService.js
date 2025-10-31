import { fetchWithAuth } from "../context/api";

export async function crearUsuario(usuarioData) {
  const res = await fetchWithAuth('/usuarios', {
    method: "POST",
    body: JSON.stringify(usuarioData),
  });

  const data = await res.json();
  if (res.status === 409) {
    throw new Error(data.error || "El correo electrónico ya está registrado.");
  }
  if (!res.ok) {
    throw new Error(data.error || "Error al crear el usuario.");
  }
  return data;
}

export async function getUsuarios() {
  const res = await fetchWithAuth('/usuarios');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al obtener la lista de usuarios.");
  }
  return res.json();
}

export async function getUsuarioById(id) {
  const res = await fetchWithAuth(`/usuarios/${id}`);
  if (res.status === 404) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Usuario con ID ${id} no encontrado.`);
  }
  if (!res.ok) {
    throw new Error("Error al buscar el usuario por ID.");
  }
  return res.json();
}

export async function getUsuarioByCorreo(correo) {
  const res = await fetchWithAuth(`/usuarios?correo=${encodeURIComponent(correo)}`);
  if (res.status === 404) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Usuario con correo ${correo} no encontrado.`);
  }
  if (!res.ok) {
    throw new Error("Error al buscar el usuario por correo.");
  }
  return res.json();
}


export async function updateUsuario(usuarioData) {
  const res = await fetchWithAuth('/usuarios/', { 
    method: "PUT",
    body: JSON.stringify(usuarioData),
  });

  const data = await res.json();
  if (res.status === 404) {
    throw new Error(data.error || "No se pudo actualizar. Usuario no encontrado.");
  }
  if (!res.ok) {
    throw new Error(data.error || "Error al actualizar el usuario.");
  }
  return data;
}

export async function deleteUsuario(id) {
  const res = await fetchWithAuth(`/usuarios/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (res.status === 404) {
    throw new Error(data.error || `No se pudo eliminar. Usuario con ID ${id} no encontrado.`);
  }
  if (!res.ok) {
    throw new Error(data.error || "Error al eliminar el usuario.");
  }
  return data;
}