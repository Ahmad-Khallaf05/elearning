import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true, // Required for Laravel Sanctum cookie-based auth
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    const locale = localStorage.getItem('locale') || 'en';
    config.headers['X-Locale'] = locale;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosInstance;
