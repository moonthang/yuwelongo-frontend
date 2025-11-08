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

  return adaptedData;
}