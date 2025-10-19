import { API_URL } from "../config";

const getToken = () => localStorage.getItem("token");

export async function crearUsuario(usuarioData) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. Se requiere autenticación.");

  const res = await fetch(`${API_URL}/usuarios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al obtener la lista de usuarios.");
  }

  return res.json();
}

export async function getUsuarioById(id) {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. Se requiere autenticación.");

  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. Se requiere autenticación.");

  const res = await fetch(`${API_URL}/usuarios?correo=${encodeURIComponent(correo)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. Se requiere autenticación.");

  const res = await fetch(`${API_URL}/usuarios/`, { 
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. Se requiere autenticación.");

  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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