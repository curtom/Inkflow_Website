import type{ User } from "@/entities/user/types/user";

export type AuthResponse = {
    message: string;
    data: {
        user: User;
        token: string;
    },
};

export type AuthPayload = AuthResponse["data"];

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
};