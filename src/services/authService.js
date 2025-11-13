import { API_URL } from "../config";

export async function loginUser(correo, contrasena) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
  });

  if (res.status === 401) {
    const errorBody = await res.json();
    throw new Error(errorBody.error || "Credenciales inválidas.");
  }

  if (!res.ok) {
    throw new Error("Error en el servidor o credenciales inválidas");
  }

  const data = await res.json();
  const adaptedData = { ...data, token: data.accessToken };
  delete adaptedData.accessToken;

  try {
    if (adaptedData.token) {
      sessionStorage.setItem('token', adaptedData.token);
      const userRes = await fetch(`${API_URL}/usuarios?correo=${encodeURIComponent(correo)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adaptedData.token}`,
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        const resolved = Array.isArray(userData) ? (userData[0] || null) : userData;
        if (resolved) {
          adaptedData.nombre = adaptedData.nombre || resolved.nombre;
          adaptedData.correo = adaptedData.correo || resolved.correo;
          adaptedData.idUsuario = adaptedData.idUsuario || resolved.idUsuario;
          adaptedData.rol = adaptedData.rol || resolved.rol;
        }
      }
    }
  } catch (err) {
    console.warn('No se pudo obtener datos adicionales del usuario tras login:', err.message || err);
  }

  return adaptedData;
}