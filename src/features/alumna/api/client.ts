import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// Todas las APIs viven bajo /api
export const api = axios.create({
  baseURL: ${API_URL}/api,
  withCredentials: true, // necesario para cookies de Sanctum
});

let csrfFetched = false;

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const mutating = ['post', 'put', 'patch', 'delete'].includes(method);
  // Antes de la primera mutación, asegúrate del CSRF cookie
  if (mutating && !csrfFetched) {
    await axios.get(${API_URL}/sanctum/csrf-cookie, { withCredentials: true });
    csrfFetched = true;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Aquí podrías centralizar 401/419, logs, etc.
    return Promise.reject(error);
  }
);
