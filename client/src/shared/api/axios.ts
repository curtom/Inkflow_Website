import axios from "axios";

/** 开发环境走 Vite 代理（同源 /api → localhost:5000），避免与后端 CORS 不一致 */
const baseURL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "/api/v1" : "http://localhost:5000/api/v1");

export const api = axios.create({
    baseURL,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error);
    }
);