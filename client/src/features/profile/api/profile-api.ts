import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Article } from "@/entities/article";

type ProfileResponse = {
    message: string;
    data: {
        user: {
            id: string;
            username: string;
            email: string;
            bio?: string;
            avatar?: string;
        };
    };
};

type ProfileArticlesResponse = {
    message: string;
    data: {
        articles: Article[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export async function getMyProfileRequest() {
    return (await api.get(ENDPOINTS.users.me)) as unknown as ProfileResponse;
}

export async function getMyArticlesRequest(page = 1, limit = 10) {
    return (await api.get(ENDPOINTS.profile.myArticles, {params: {page, limit}})) as unknown as ProfileArticlesResponse;
}