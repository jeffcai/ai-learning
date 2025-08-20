import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => api.post('/auth/register', data),

  login: (data: { login: string; password: string }) =>
    api.post('/auth/login', data),

  googleLogin: (token: string) =>
    api.post('/auth/oauth/google', { token }),

  getProfile: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  // New validation endpoints
  checkAvailability: (field: string, value: string) =>
    api.post('/auth/check-availability', { field, value }),

  validatePassword: (password: string) =>
    api.post('/auth/validate-password', { password }),
};

// Articles API
export const articlesAPI = {
  getArticles: (params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
    date?: string;
    tag?: string;
    view?: 'public' | 'own';
  }) => api.get('/articles', { params }),

  getArticle: (id: number) => api.get(`/articles/${id}`),

  createArticle: (data: {
    title: string;
    url: string;
    notes?: string;
    tags?: string;
    reading_date?: string;
    is_public?: boolean;
  }) => api.post('/articles', data),

  updateArticle: (id: number, data: Partial<{
    title: string;
    url: string;
    notes: string;
    tags: string;
    reading_date: string;
    is_public: boolean;
  }>) => api.put(`/articles/${id}`, data),

  deleteArticle: (id: number) => api.delete(`/articles/${id}`),
};

// Digests API
export const digestsAPI = {
  getDigests: (params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
    view?: 'public' | 'own';
  }) => api.get('/digests', { params }),

  getDigest: (id: number) => api.get(`/digests/${id}`),

  createDigest: (data: {
    title: string;
    content: string;
    summary?: string;
    week_start: string;
    week_end: string;
    is_published?: boolean;
    is_public?: boolean;
  }) => api.post('/digests', data),

  updateDigest: (id: number, data: Partial<{
    title: string;
    content: string;
    summary: string;
    week_start: string;
    week_end: string;
    is_published: boolean;
    is_public: boolean;
  }>) => api.put(`/digests/${id}`, data),

  deleteDigest: (id: number) => api.delete(`/digests/${id}`),

  generateWeeklyDigest: (data?: {
    week_start?: string;
    week_end?: string;
  }) => api.post('/digests/generate-weekly', data),
};

// Users API
export const usersAPI = {
  getUsers: (params?: { page?: number; per_page?: number }) =>
    api.get('/users', { params }),

  getUser: (id: number) => api.get(`/users/${id}`),

  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
  }>) => api.put('/users/profile', data),

  changePassword: (data: {
    current_password: string;
    new_password: string;
  }) => api.post('/users/change-password', data),

  deactivateAccount: () => api.post('/users/deactivate'),
};

export default api;
