import axios from "axios";
import { getToken, getSessionId } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---- Request interceptor ----
// Inject auth token + guest session ID on every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Guest cart support
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers["X-Session-ID"] = sessionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor ----
// Handle 401 → redirect to login, extract error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Unauthorized — clear token and redirect to login
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("voxel_token");
          localStorage.removeItem("voxel_user");
          const currentPath = window.location.pathname;
          // Only redirect if not already on auth pages
          if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ---- Typed API helpers ----

export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const res = await api.get<T>(url, { params });
  return res.data;
}

export async function apiPost<T>(url: string, data?: object | FormData): Promise<T> {
  const isFormData = data instanceof FormData;
  const res = await api.post<T>(url, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
}

export async function apiPut<T>(url: string, data?: object | FormData): Promise<T> {
  const isFormData = data instanceof FormData;
  const res = await api.put<T>(url, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete<T>(url);
  return res.data;
}
