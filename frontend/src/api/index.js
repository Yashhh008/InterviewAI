import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Resume
export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get: () => api.get('/resume'),
  delete: () => api.delete('/resume'),
};

// Job Description
export const jdAPI = {
  analyze: (data) => {
    if (data instanceof FormData) {
      return api.post('/jd/analyze', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/jd/analyze', data);
  },
  getAll: () => api.get('/jd'),
  getOne: (id) => api.get(`/jd/${id}`),
  delete: (id) => api.delete(`/jd/${id}`),
};

// ATS
export const atsAPI = {
  match: (data) => api.post('/ats/match', data),
  getReports: () => api.get('/ats/reports'),
  getReport: (id) => api.get(`/ats/reports/${id}`),
};

// Company
export const companyAPI = {
  research: (name) => api.post('/company/research', { name }),
  getAll: () => api.get('/company'),
  getOne: (name) => api.get(`/company/${name}`),
};

// Interview
export const interviewAPI = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (id, data) => api.post(`/interview/${id}/submit-answer`, data),
  skip: (id, data) => api.post(`/interview/${id}/skip`, data),
  complete: (id) => api.post(`/interview/${id}/complete`),
  getHistory: (params) => api.get('/interview/history', { params }),
  getOne: (id) => api.get(`/interview/${id}`),
};

// Analytics
export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getStats: () => api.get('/admin/stats'),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
};
