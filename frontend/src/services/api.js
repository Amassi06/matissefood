import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (username, password) =>
    api.post('/auth/login', { username, password });

// Codes
export const generateCodes = (count) =>
    api.post('/codes/generate', { count });

export const getCodes = (params) =>
    api.get('/codes', { params });

// Prizes (admin)
export const getPrizes = () =>
    api.get('/prizes');

export const updatePrize = (id, data) =>
    api.put(`/prizes/${id}`, data);

export const createPrize = (data) =>
    api.post('/prizes', data);

// Play (client)
export const validateCode = (code) =>
    api.post('/play/validate', { code });

export const spinWheel = (codeId) =>
    api.post('/play/spin', { codeId });

export const getPublicPrizes = () =>
    api.get('/play/prizes');

// Redeem
export const redeemCode = (codeId) =>
    api.post(`/redeem/${codeId}`);

export const lookupCode = (code) =>
    api.post('/redeem/lookup/code', { code });

// Stats
export const getStats = () =>
    api.get('/stats');

// Settings
export const getSettings = () =>
    api.get('/settings');

export const updateSettings = (settings) =>
    api.put('/settings', { settings });

export const getPublicSettings = () =>
    api.get('/settings/public');

export default api;
