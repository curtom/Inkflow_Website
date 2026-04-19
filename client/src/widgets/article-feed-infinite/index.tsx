import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getArticlesRequest } from "@/entities/article/api/article-api";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";

type ArticleFeedInfiniteProps = {
  tag?: string;
  limit: number;
  compact?: boolean;
  columns?: 1 | 2;
};

export default function ArticleFeedInfinite({
  tag,
  limit,
  compact = false,
  columns = 1,
}: ArticleFeedInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: queryKeys.articles.infiniteList(limit, tag ?? ""),
      queryFn: ({ pageParam }) =>
        getArticlesRequest(pageParam, limit, tag || undefined),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
    });

  const articles = data?.pages.flatMap((p) => p.articles) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "240px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <p className="text-gray-500">加载中…</p>;
  }

  if (isError) {
    return <p className="text-red-500">加载失败。</p>;
  }

  return (
    <div>
      <ArticleList articles={articles} compact={compact} columns={columns} />

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

      {isFetchingNextPage ? (
        <p className="py-6 text-center text-sm text-gray-500">加载更多…</p>
      ) : null}

      {!hasNextPage && articles.length > 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">已显示全部内容</p>
      ) : null}
    </div>
  );
}
