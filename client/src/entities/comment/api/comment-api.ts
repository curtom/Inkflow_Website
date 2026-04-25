import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
  CommentCreateResponse,
  CommentListResponse,
  CommentNode,
  CommentSort,
} from "../types/comment";

function normalizeCommentNode(node: CommentNode): CommentNode {
  const repliesRaw = node.replies;
  const children = Array.isArray(repliesRaw) ? repliesRaw : [];
  return {
    ...node,
    likesCount: node.likesCount ?? 0,
    isLiked: node.isLiked ?? false,
    replyCount: node.replyCount ?? 0,
    replies: children.map((c) => normalizeCommentNode(c)),
  };
}

export async function getCommentsByArticleRequest(slug: string, sort: CommentSort = "newest") {
  const res = (await api.get(ENDPOINTS.comments.list(slug), {
    params: { sort },
  })) as unknown as CommentListResponse;

  const d = res.data;
  const rawComments = d?.comments;
  const list = Array.isArray(rawComments) ? rawComments : [];

  return {
    ...res,
    data: {
      ...(d ?? {}),
      comments: list.map((c) => normalizeCommentNode(c as CommentNode)),
      total: d?.total ?? 0,
      pinnedCommentId: d?.pinnedCommentId ?? null,
    },
  };
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
