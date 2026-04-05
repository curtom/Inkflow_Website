import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    AuthPayload,
    LoginPayload,
    RegisterPayload,
} from "@/features/auth/model/types";

export async function loginRequest(payload: LoginPayload) {
    const { data } = await api.post<AuthPayload>(ENDPOINTS.auth.login, payload);
    return data;
}

export async function registerRequest(payload: RegisterPayload) {
    const { data } = await api.post<AuthPayload>(
        ENDPOINTS.auth.register,
        payload
    );
    return data;
}

export async function getCurrentUserRequest() {
    const { data } = await api.get<AuthPayload>(ENDPOINTS.auth.me);
    return data;
}