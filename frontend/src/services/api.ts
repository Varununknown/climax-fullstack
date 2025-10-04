// src/api.ts
import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const apiBaseURL = `${backendURL}/api`;

console.log('🔗 API Base URL:', apiBaseURL);
console.log('🔗 Backend URL:', backendURL);

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default API;
