export async function loginUser(correo, contrasena) {
  const res = await fetch("http://localhost:8080/YuweLongo-Backend/api/login", {
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

  return res.json();
}