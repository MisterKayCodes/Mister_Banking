import axios from 'axios';

// ## -------------------- THE NERVE CENTER (API ROUTER) --------------------
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.endsWith('/') ? url : `${url}/`;
  }

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    // Production: Always use the absolute /api/ path on the current domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}/api/`;
    }
    // Local: Always use port 5000
    return `${protocol}//${hostname}:5000/api/`;
  }
  return 'http://localhost:5000/api/';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// ## -------------------- THE OUTGOING GUARD --------------------
// This attaches the 'sa_auth_token' to every single request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ## -------------------- THE INCOMING SENTRY --------------------
// If the backend says '401 Unauthorized', we clear the storage and redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sa_auth_token');
      // If the credentials are invalid, redirect to login.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;