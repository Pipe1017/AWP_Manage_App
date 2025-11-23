// frontend/src/api/axios.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: baseURL,
  // ❌ ELIMINAMOS ESTO: headers: { 'Content-Type': 'application/json' }
  // Dejamos que Axios decida el tipo de contenido automáticamente.
});

export default client;