import axios from "axios";

const API_URL = ((import.meta.env.VITE_API_URL as string) || "https://api.espaciopilatescl.cl").replace(/\/$/, "");

// Cliente por defecto SIN cookies (evitamos CORS en GET)
export const api = axios.create({
  baseURL: API_URL + "/api",
  withCredentials: false,
});

let csrfFetched = false;

api.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toLowerCase();
  const mutating = ["post", "put", "patch", "delete"].includes(method);
  if (mutating) {
    // Sólo para mutaciones pedimos cookie CSRF y habilitamos credenciales
    if (!csrfFetched) {
      await axios.get(API_URL + "/sanctum/csrf-cookie", { withCredentials: true });
      csrfFetched = true;
    }
    config.withCredentials = true;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => Promise.reject(error)
);
