import axios from 'axios';

// ## -------------------- THE NERVE CENTER (API ROUTER) --------------------
// Dynamically determine the backend URL so mobile devices on the same WiFi 
// don't try to dial their own 'localhost'.
const getBaseUrl = () => {
  // 1. If we have a specific API URL in the .env, use it!
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. In Production (VPS), we want to talk to Nginx on the SAME domain.
  // We do NOT add :5000 because Nginx is our receptionist on the main gate (Port 80/443).
  if (typeof window !== 'undefined') {
    // If we are on the real domain (not localhost), just use the domain as is.
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api'; // Use /api as the prefix for all backend calls
    }
    // For local development, we still need port 5000.
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
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