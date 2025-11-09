// src/api.ts
import axios from "axios";

// Determine backend at runtime. Try localhost first (dev), but fall back to configured URL if unreachable.
const PROD_BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://climax-fullstack.onrender.com';
const PREFERRED_LOCAL = 'http://localhost:5000';

// Force local development when running on localhost
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Determine which backend to use
const backendUrl = isLocalDevelopment ? PREFERRED_LOCAL : PROD_BACKEND;

// Build API instance
const API = axios.create({ 
  baseURL: `${backendUrl}/api`,
  withCredentials: true, 
  timeout: 10000
});

// Log which backend is being used
console.log(isLocalDevelopment ? '🔧 DEV MODE: Using localhost backend' : '🚀 PROD MODE: Using production backend');
console.log('📍 Backend URL:', backendUrl);

// Add response interceptor for debugging on localhost
API.interceptors.response.use(
  (response) => {
    if (isLocalDevelopment) {
      console.log(`📡 API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (isLocalDevelopment) {
      console.error(`❌ API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export default API;
