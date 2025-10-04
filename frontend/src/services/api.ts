// src/api.ts
import axios from "axios";

// Use the working backend URL or fallback
const backendURL = import.meta.env.VITE_BACKEND_URL || 'https://climax-fullstack.onrender.com';
const apiBaseURL = `${backendURL}/api`;

console.log('🔗 API Base URL:', apiBaseURL);
console.log('🔗 Backend URL:', backendURL);

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
