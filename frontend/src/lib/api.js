import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
};

// Category API
export const categoryAPI = {
    getAll: (params) => api.get('/categories', { params }),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Asset API
export const assetAPI = {
    getAll: (params) => api.get('/assets', { params }),
    getById: (id) => api.get(`/assets/${id}`),
    create: (data) => api.post('/assets', data),
    update: (id, data) => api.put(`/assets/${id}`, data),
    delete: (id) => api.delete(`/assets/${id}`),
    getLogs: (id, params) => api.get(`/assets/${id}/logs`, { params }),
};

// Department API
export const departmentAPI = {
    getAll: (params) => api.get('/departments', { params }),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
    getSummary: (id) => api.get(`/departments/${id}/summary`),
};

// Location API
export const locationAPI = {
    getAll: (params) => api.get('/locations', { params }),
    getGrouped: () => api.get('/locations/grouped'),
    getById: (id) => api.get(`/locations/${id}`),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data),
    delete: (id) => api.delete(`/locations/${id}`),
    bulkCreate: (data) => api.post('/locations/bulk', data),
};

// Item Type API
export const itemTypeAPI = {
    getAll: (params) => api.get('/item-types', { params }),
    getGrouped: () => api.get('/item-types/grouped'),
    getById: (id) => api.get(`/item-types/${id}`),
    create: (data) => api.post('/item-types', data),
    update: (id, data) => api.put(`/item-types/${id}`, data),
    delete: (id) => api.delete(`/item-types/${id}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getDepartmentSummary: () => api.get('/dashboard/department-summary'),
    getLocationSummary: (params) => api.get('/dashboard/location-summary', { params }),
};

export default api;
