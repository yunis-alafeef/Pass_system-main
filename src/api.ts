import axios from 'axios';

// Create Axios Instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor for Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle refreshing token logic here in the future
            console.log('Unauthorized - Token expired or invalid');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
