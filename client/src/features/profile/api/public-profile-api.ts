import { ENDPOINTS } from "@/shared/api/endpoints";
import { api } from "@/shared/api/axios";
import type { Article } from "@/entities/article";


type PublicProfileResponse = {
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

type PublicProfileArticlesResponse = {
    message: string;
    data: {
        user: {
            id: string;
            username: string;
            email: string;
            bio?: string;
            avatar?: string;
        };
        articles: Article[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export async function getPublicProfileRequest(username: string) {
    return (await api.get(ENDPOINTS.publicProfile.detail(username))) as unknown as PublicProfileResponse;
}

export async function getPublicProfileArticlesRequest(
    username: string,
    page = 1,
    limit = 10
) {
    return (await api.get(ENDPOINTS.publicProfile.articles(username), {params: {page, limit}})) as unknown as PublicProfileArticlesResponse;
}