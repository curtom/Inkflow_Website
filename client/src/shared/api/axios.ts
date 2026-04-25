import axios from "axios";

/**
 * - 开发：Vite 代理 `/api` → 本地后端
 * - 生产：未配置 `VITE_API_BASE_URL` 时用同源相对路径 `/api/v1`（需网关反代到后端）。
 *   若 API 在其它域名，必须在构建时设置 `VITE_API_BASE_URL`（勿使用 localhost）。
 */
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api/v1" : "/api/v1");

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