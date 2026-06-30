import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

// In dev, Vite proxies /api → http://localhost:4000.
// In prod (Firebase Hosting), set VITE_API_BASE_URL to your Cloud Run URL.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function useApi() {
  const { token, logout } = useAuth();

  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        logout();
        if (!window.location.pathname.endsWith('/login')) window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  return api;
}

export default api;
