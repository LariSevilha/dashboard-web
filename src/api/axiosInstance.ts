import axios from 'axios';

const apiKey = localStorage.getItem('apiKey');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
  },
});

export default axiosInstance;
