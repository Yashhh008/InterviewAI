import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || '/api';
// Strip trailing slash if present
baseUrl = baseUrl.replace(/\/$/, '');

// If it is a full URL but doesn't end with /api, append it
if (baseUrl.startsWith('http') && !baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s for AI responses
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interviewai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('interviewai_token');
      localStorage.removeItem('interviewai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
