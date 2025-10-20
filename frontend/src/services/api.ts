// src/api.ts
import axios from "axios";

// Determine backend at runtime. Try localhost first (dev), but fall back to configured URL if unreachable.
const PROD_BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://climax-backend.onrender.com';
const PREFERRED_LOCAL = 'http://localhost:5000';

// Helper: test a URL quickly
async function testUrl(url: string) {
  try {
    const res = await axios.get(url + '/api/contents', { timeout: 1500 });
    return Array.isArray(res.data);
  } catch (e) {
    return false;
  }
}

// Force local development when running on localhost
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Build default API instance (will be replaced after health check)
let API = axios.create({ 
  baseURL: isLocalDevelopment ? `${PREFERRED_LOCAL}/api` : `${PROD_BACKEND}/api`, 
  withCredentials: true, 
  timeout: 10000 // Increased timeout for production
});

(async () => {
  // If running on localhost hostname, prefer local backend when reachable
  try {
    if (isLocalDevelopment) {
      const useLocal = await testUrl(PREFERRED_LOCAL);
      const chosen = useLocal ? PREFERRED_LOCAL : PROD_BACKEND;
      API = axios.create({ baseURL: `${chosen}/api`, withCredentials: true, timeout: 10000 });
      // Expose chosen backend for debugging
      (window as any).__BACKEND__ = chosen;
      console.log('🔧 DEV MODE: API using backend ->', chosen);
    } else {
      (window as any).__BACKEND__ = PROD_BACKEND;
      console.log('🚀 PROD MODE: API using backend ->', PROD_BACKEND);
    }
  } catch (e) {
    console.log('API: falling back to', PROD_BACKEND);
  }
})();

export default API;
