import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snist_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data?.message?.includes('expired') || error.response.data?.message?.includes('denied')) {
        // Only clear if token was actually invalid/expired
        // localStorage.removeItem('snist_auth_token');
        // localStorage.removeItem('snist_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
