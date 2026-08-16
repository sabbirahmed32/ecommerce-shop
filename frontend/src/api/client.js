import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRequest = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');

    if (status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export function extractError(error) {
  const data = error.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];
    return data.errors[firstKey]?.[0] || data.message;
  }
  return data.message || 'Something went wrong. Please try again.';
}

export default client;
