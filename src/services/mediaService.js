import { uploadFileToFirebase, deleteFileFromFirebase } from "./firebaseService";

export async function subirArchivo(file, folder) {
    if (!(file instanceof File)) {
        throw new Error("El objeto proporcionado no es un archivo válido.");
    }
    return await uploadFileToFirebase(file, folder);
}

export async function eliminarArchivo(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        console.warn("Se intentó eliminar un archivo sin una ruta válida.");
        return;
    }
    await deleteFileFromFirebase(filePath);
}