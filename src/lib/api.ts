import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — no need to handle it per-call
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("userToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const http = {
  get: <T>(url: string, params?: Record<string, any>) =>
    api.get<{ data: T }>(url, { params }).then((r) => r.data.data),

  post: <T>(url: string, body?: unknown) =>
    api.post<{ data: T }>(url, body).then((r) => r.data.data),

  patch: <T>(url: string, body?: unknown) =>
    api.patch<{ data: T }>(url, body).then((r) => r.data.data),

  put: <T>(url: string, body?: unknown) =>
    api.put<{ data: T }>(url, body).then((r) => r.data.data),

  delete: <T>(url: string, body?: unknown) =>
    api.delete<{ data: T }>(url, { data: body }).then((r) => r.data.data),
};
