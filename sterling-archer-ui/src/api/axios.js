import axios from 'axios';

// ## -------------------- THE NERVE CENTER (API ROUTER) --------------------
// Dynamically determine the backend URL so mobile devices on the same WiFi 
// don't try to dial their own 'localhost'.
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000') {
    return import.meta.env.VITE_API_URL;
  }

  // If no specific environment variable is set, route to the same IP serving the frontend, but port 5000.
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
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