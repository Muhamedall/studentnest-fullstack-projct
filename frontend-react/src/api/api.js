import Axios from 'axios';

const axios = Axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
    withCredentials: true,
});

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const STORAGE_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000") + '/storage/';

export default axios;
