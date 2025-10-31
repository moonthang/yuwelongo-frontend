import { API_URL } from "../config";

const getToken = () => localStorage.getItem("token");

export async function fetchWithAuth(endpoint, options = {}) {
    const token = getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: defaultHeaders,
    });

    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        throw new Error('Sesión expirada.');
    }

    return response;
}