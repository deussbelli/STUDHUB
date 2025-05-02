import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000', // або http://localhost:5000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
