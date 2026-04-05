import { api } from "@/shared/api/axios";
import type {
    ApiResponse,
    ArticleDetailData,
    ArticleListData,
    CreateArticlePayload,
    UpdateArticlePayload,
} from "@/entities/article";
import { ENDPOINTS } from "@/shared/api/endpoints";

export async function getArticlesRequest(
    page = 1,
    limit = 10
): Promise<ArticleListData> {
    const response = (await api.get(
        ENDPOINTS.articles.list,
        {
            params: { page, limit },
        }
    )) as unknown as ApiResponse<ArticleListData>;

    return response.data;
}

export async function getArticleBySlugRequest(
    slug: string
): Promise<ArticleDetailData> {
    const response = (await api.get(
        ENDPOINTS.articles.detail(slug)
    )) as unknown as ApiResponse<ArticleDetailData>;

    return response.data;
}

export async function createArticleRequest(
    payload: CreateArticlePayload
): Promise<ArticleDetailData> {
    const response = (await api.post(
        ENDPOINTS.articles.create,
        payload
    )) as unknown as ApiResponse<ArticleDetailData>;

    return response.data;
}

export async function updateArticleRequest(
    slug: string,
    payload: UpdateArticlePayload
): Promise<ArticleDetailData> {
    const response = (await api.patch(
        ENDPOINTS.articles.update(slug),
        payload
    )) as unknown as ApiResponse<ArticleDetailData>;

    return response.data;
}

export async function deleteArticleRequest(
    slug: string
): Promise<{ deleted: boolean }> {
    const response = (await api.delete(
        ENDPOINTS.articles.delete(slug)
    )) as unknown as ApiResponse<{ deleted: boolean }>;

    return response.data;
}