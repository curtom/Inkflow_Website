import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://inkflowx.netlify.app";

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