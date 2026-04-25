import type { Article } from "@/entities/article";

/** First page: prepend API `pinnedArticle` and mark it; other pages: list as-is. */
export function mergeProfileArticleList(
  page: number,
  pinnedArticle: Article | null | undefined,
  list: Article[]
): Article[] {
  if (page === 1 && pinnedArticle) {
    return [
      { ...pinnedArticle, isProfilePinned: true },
      ...list.map((a) => ({ ...a, isProfilePinned: false })),
    ];
  }
  return list.map((a) => ({ ...a, isProfilePinned: false }));
}
