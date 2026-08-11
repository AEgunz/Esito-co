import axios from 'axios';

const isProd = window.location.hostname.includes('estilo-co.ma') || window.location.hostname.includes('railway.app');
const PROD_URL = 'https://esito-co-production.up.railway.app';

const API_URL = import.meta.env.VITE_API_URL || (isProd ? `${PROD_URL}/api` : 'http://localhost:5000/api');
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || (isProd ? PROD_URL : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
