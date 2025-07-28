// utils/axiosConfig.ts
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Request interceptor to add API key and device ID
api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
    
    if (deviceId) {
      config.headers['Device-ID'] = deviceId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored data and redirect to login
      localStorage.removeItem('apiKey');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;