// src/api.ts
import axios from "axios";

// Use local development or production backend
const backendURL = import.meta.env.VITE_BACKEND_URL || 'https://climax-fullstack.onrender.com';
const apiBaseURL = `${backendURL}/api`;

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 5000, // Faster timeout
});

export default API;
