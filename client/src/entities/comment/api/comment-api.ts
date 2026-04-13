import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { CommentListResponse, CommentDetailResponse } from "../types/comment";

export async function getCommentsByArticleRequest(slug: string) {
    return (await api.get(ENDPOINTS.comments.list(slug))) as unknown as CommentListResponse ;
}

export async function createCommentRequest(slug: string, content: string) {
    return (await api.post(ENDPOINTS.comments.create(slug), { content })) as unknown as CommentDetailResponse;
}

export async function deleteCommentRequest(slug: string, commentId: string) {
    return (await api.delete(ENDPOINTS.comments.delete(slug, commentId))) as unknown as { deleted: boolean };
}