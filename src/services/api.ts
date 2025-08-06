// src/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // ❌ no fallback to localhost
  withCredentials: true,
});

export default API;
