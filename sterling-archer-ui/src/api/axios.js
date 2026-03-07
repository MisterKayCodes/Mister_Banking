import axios from 'axios';

const api = axios.create({
  // Ensure your .env has VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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