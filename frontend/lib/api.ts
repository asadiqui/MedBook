import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/me') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/find-doctor'];
          const currentPath = window.location.pathname;
          const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/auth/'));
          
          if (!isPublicRoute) {
            window.location.href = "/auth/login";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
