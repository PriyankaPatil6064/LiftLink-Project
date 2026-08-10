import axios from "axios";

// H-4: Centralized axios instance with environment-based base URL
// Set REACT_APP_API_URL in client/.env (e.g., REACT_APP_API_URL=http://localhost:5000)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const vendorData = localStorage.getItem("vendor");
  const userData = localStorage.getItem("user");

  let token = null;
  if (vendorData) {
    try {
      token = JSON.parse(vendorData).token;
    } catch {}
  } else if (userData) {
    try {
      token = JSON.parse(userData).token;
    } catch {}
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on auth endpoints themselves (avoid infinite loops)
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/login") || url.includes("/signup") || url.includes("/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("vendor");
        localStorage.removeItem("user");
        localStorage.removeItem("vendorId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
