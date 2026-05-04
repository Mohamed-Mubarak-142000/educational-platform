import axios from "axios";

// Get API base URL from environment variables, fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercept 401/403 responses.
// 401 → session expired, redirect to login.
// 403 → only redirect to /unauthorized for GET/navigation requests,
//        not for POST/PUT/DELETE mutations (those should surface as form errors).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / not authenticated
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      const method = (error.config?.method ?? "").toUpperCase();
      const message = (error.response?.data?.message ?? "") as string;
      const isLessonLocked = message.toLowerCase().includes("lesson locked");
      // Only redirect to unauthorized page for GET requests (page-level access)
      // Mutation failures (POST/PUT/DELETE) return the error to the caller
      if (method === "GET" && !isLessonLocked) {
        window.location.href = "/unauthorized";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
