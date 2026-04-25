import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
  CommentCreateResponse,
  CommentListResponse,
  CommentSort,
} from "../types/comment";

export async function getCommentsByArticleRequest(slug: string, sort: CommentSort = "newest") {
  return (await api.get(ENDPOINTS.comments.list(slug), {
    params: { sort },
  })) as unknown as CommentListResponse;
}

export async function createCommentRequest(
  slug: string,
  content: string,
  options?: { parentCommentId?: string }
) {
  const body: { content: string; parentCommentId?: string } = { content };
  if (options?.parentCommentId) {
    body.parentCommentId = options.parentCommentId;
  }
  return (await api.post(ENDPOINTS.comments.create(slug), body)) as unknown as CommentCreateResponse;
}

export async function deleteCommentRequest(slug: string, commentId: string) {
  return (await api.delete(ENDPOINTS.comments.delete(slug, commentId))) as unknown as {
    deleted: boolean;
    removedCount?: number;
  };
}

export async function toggleCommentLikeRequest(slug: string, commentId: string) {
  return (await api.post(ENDPOINTS.comments.like(slug, commentId))) as unknown as {
    message: string;
    data: { liked: boolean; likesCount: number };
  };
}

export async function setPinnedCommentRequest(slug: string, commentId: string | null) {
  return (await api.patch(ENDPOINTS.comments.pin(slug), { commentId })) as unknown as {
    message: string;
    data: { pinnedCommentId: string | null };
  };
}
