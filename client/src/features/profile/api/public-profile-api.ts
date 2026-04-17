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
            followersCount: number;
            followingCount: number;
            isFollowing: boolean;
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
            followersCount: number;
            followingCount: number;
            isFollowing: boolean;
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

export async function followUserRequest(username: string) {
    return (await api.post(ENDPOINTS.publicProfile.follow(username))) as unknown as PublicProfileResponse;
}

export async function unfollowUserRequest(username: string) {
    return (await api.delete(ENDPOINTS.publicProfile.follow(username))) as unknown as PublicProfileResponse;
}