import { api } from "@/shared/api/axios";
import type {
    ApiResponse,
    ArticleDetailData,
    ArticleListData,
    CreateArticlePayload,
    UpdateArticlePayload,
} from "@/entities/article";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { normalizeArticle } from "../lib/normalize-article";

export async function getArticlesRequest(
    page = 1,
    limit = 10,
    tag?: string
): Promise<ArticleListData> {
    const response = (await api.get(
        ENDPOINTS.articles.list,
        {
            params: { page, limit, ...(tag ? { tag } : {}) },
        }
    )) as unknown as ApiResponse<ArticleListData>;

    const list = response.data;
    if (!list) {
        return {
            articles: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
        };
    }
    const raw = list.articles ?? [];
    return {
        ...list,
        articles: raw.map((a) => normalizeArticle(a)!).filter(Boolean),
    };
}

export async function getArticleBySlugRequest(
    slug: string
): Promise<ArticleDetailData> {
    const response = (await api.get(
        ENDPOINTS.articles.detail(slug)
    )) as unknown as ApiResponse<ArticleDetailData>;

    const inner = response.data;
    const article = normalizeArticle(inner.article);
    if (!article) {
        throw new Error("Invalid article payload");
    }
    return { article };
}

export async function createArticleRequest(
    payload: CreateArticlePayload
): Promise<ArticleDetailData> {
    const response = (await api.post(
        ENDPOINTS.articles.create,
        payload
    )) as unknown as ApiResponse<ArticleDetailData>;

    const inner = response.data;
    const article = normalizeArticle(inner.article);
    if (!article) {
        throw new Error("Invalid article payload");
    }
    return { article };
}

export async function updateArticleRequest(
    slug: string,
    payload: UpdateArticlePayload
): Promise<ArticleDetailData> {
    const response = (await api.patch(
        ENDPOINTS.articles.update(slug),
        payload
    )) as unknown as ApiResponse<ArticleDetailData>;

    const inner = response.data;
    const article = normalizeArticle(inner.article);
    if (!article) {
        throw new Error("Invalid article payload");
    }
    return { article };
}

export async function deleteArticleRequest(
    slug: string
): Promise<{ deleted: boolean }> {
    const response = (await api.delete(
        ENDPOINTS.articles.delete(slug)
    )) as unknown as ApiResponse<{ deleted: boolean }>;

    return response.data;
}