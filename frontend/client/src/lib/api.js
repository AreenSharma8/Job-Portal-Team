import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  getJobBySlug: (slug) => api.get(`/jobs/slug/${slug}`),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getCategories: () => api.get('/jobs/categories'),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),
};

// Users API
export const usersAPI = {
  getApplicantProfile: () => api.get('/users/profile/applicant'),
  updateApplicantProfile: (data) => api.put('/users/profile/applicant', data),
  uploadResume: (formData) =>
    api.post('/users/profile/applicant/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPublicProfile: (id) => api.get(`/users/profile/applicant/${id}`),
  toggleBookmark: (jobId) => api.post(`/users/bookmark/${jobId}`),
  getCompanyProfile: () => api.get('/users/profile/company'),
  updateCompanyProfile: (data) => api.put('/users/profile/company', data),
  getPublicCompany: (id) => api.get(`/users/companies/${id}`),
  listCompanies: (params) => api.get('/users/companies', { params }),
};

// Applications API
export const applicationsAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id, reason) => api.post(`/applications/${id}/withdraw`, { reason }),
  getEmployerApplications: (params) => api.get('/applications/employer', { params }),
};

// Search API
export const searchAPI = {
  searchJobs: (params) => api.get('/search/jobs', { params }),
  suggest: (q) => api.get('/search/suggest', { params: { q } }),
  trending: () => api.get('/search/trending'),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  moderateJob: (id, status) => api.put(`/admin/jobs/${id}/moderate`, { status }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
