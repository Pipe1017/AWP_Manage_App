// frontend/src/api/axios.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: baseURL,
  // ❌ NO PONER HEADERS AQUÍ
});

client.interceptors.request.use(
  config => {
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    if (config.data instanceof FormData) {
      console.log('📦 FormData detected');
      for (let pair of config.data.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

client.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    console.error('Detail:', error.response?.data);
    return Promise.reject(error);
  }
);

export default client;