import { ENDPOINTS } from "@/shared/api/endpoints";
import { api } from "@/shared/api/axios";

type ReactionResponse = {
    message: string;
    data: {
        liked?: boolean;
        likesCount?: number;
        favorited?: boolean;
        favoritesCount?: number;
    };
};

export async function toggleLikeArticleRequest(slug: string) {
    return (await api.post(ENDPOINTS.reactions.like(slug))) as unknown as ReactionResponse;
}

export async function toggleFavoriteArticleRequest(slug: string) {
    return (await api.post(ENDPOINTS.reactions.favorite(slug))) as unknown as ReactionResponse;
}