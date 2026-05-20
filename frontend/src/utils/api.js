import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isMeCheck = url.endsWith('/auth/me');
      const onAuthPage =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register');

      localStorage.removeItem('token');

      if (!isMeCheck && !onAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
