import axios from 'axios';
import { store } from '../store/index.js';
import { setCredentials, clearCredentials } from '../store/slices/authSlice.js';

// Configure default base parameters for the server connection
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken = '';

// Sets the transient in-memory access token
export const setAccessToken = (token) => {
  inMemoryToken = token;
};

// Request interceptor attaches authorization headers dynamically
api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

// Response interceptor monitors authorization expiry and executes silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.token;
        setAccessToken(newToken);
        store.dispatch(setCredentials({ token: newToken }));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken('');
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
