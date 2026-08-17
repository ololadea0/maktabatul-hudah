import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Let the browser set multipart boundaries; the default JSON header breaks file uploads.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  }

  return config;
});

export default api;
