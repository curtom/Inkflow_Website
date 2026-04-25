import type { Article } from "../types/article";

/** Harden against missing array fields from older API responses or partial JSON. */
export function normalizeArticle(article: Article | null | undefined): Article | null {
  if (!article) {
    return null;
  }
  return {
    ...article,
    tags: Array.isArray(article.tags) ? article.tags : [],
    likesCount: article.likesCount ?? 0,
    favoritesCount: article.favoritesCount ?? 0,
    commentsCount: article.commentsCount ?? 0,
    viewsCount: article.viewsCount ?? 0,
    isLiked: article.isLiked ?? false,
    isFavorited: article.isFavorited ?? false,
  };
}
