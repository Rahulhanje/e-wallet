import axios from "axios";

const instance = axios.create({ baseURL: "http://localhost:8080/api/v1" });
instance.defaults.headers.common["Content-Type"] = "application/json";

// Intercept 401 responses and clear stale auth data
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't clear user data for login/signup endpoints (they handle their own errors)
      const url = error.config?.url || '';
      if (!url.includes('/auth/')) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
