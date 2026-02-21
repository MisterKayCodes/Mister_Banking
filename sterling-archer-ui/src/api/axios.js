import axios from 'axios';

const api = axios.create({
  // Mister, ensure your .env has VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || 'http://172.20.10.5:8000',
});

// ## -------------------- THE OUTGOING GUARD --------------------
// Mister, this attaches the 'mister_token' to every single request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mister_token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ## -------------------- THE INCOMING SENTRY --------------------
// Mister, if the backend says '401 Unauthorized', we clear the vault and redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mister_token');
      // Mister, 'if the badge is fake, we escort them out.'
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;