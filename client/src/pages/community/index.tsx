import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getArticlesRequest } from "@/entities/article/api/article-api";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import Button from "@/shared/ui/button";
import {
  COMMUNITY_CONFIG_MAP,
  isCommunityId,
} from "@/features/community/lib/community-config";

export default function CommunityPage() {
  const { communityId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isCommunityId(communityId)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-500">Community not found.</p>
      </div>
    );
  }

  const community = COMMUNITY_CONFIG_MAP[communityId];

  const page = Number(searchParams.get("page") || "1");
  const groupKeyFromQuery = searchParams.get("group") || "";
  const activeGroup = community.tabs.some((tab) => tab.key === groupKeyFromQuery)
    ? groupKeyFromQuery
    : community.tabs[0]?.key ?? "";
  const activeTab = community.tabs.find((tab) => tab.key === activeGroup);
  const activeTag = activeTab?.tag;
  const limit = 12;

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.articles.list(page, limit, activeTag),
    queryFn: () => getArticlesRequest(page, limit, activeTag),
  });

  const articles = data?.articles ?? [];
  const pagination = data?.pagination;

  const pageTitle = useMemo(() => {
    const activeGroupLabel = activeTab?.label ?? activeGroup;
    return `${community.title} · ${activeGroupLabel}`;
  }, [community, activeGroup, activeTab]);

  return (
    <div className="mx-auto max-w-8xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{community.title}</h1>
          <p className="mt-2 text-gray-600">{community.description}</p>
          <p className="mt-1 text-sm text-gray-500">{pageTitle}</p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Groups
          </h2>
          <div className="space-y-2">
            {community.tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSearchParams({ group: tab.key, page: "1" });
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  activeGroup === tab.key
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section>
          {isLoading ? <p>Loading community posts...</p> : null}
          {isError ? <p>Failed to load community posts.</p> : null}
          {!isLoading && !isError ? (
            <ArticleList articles={articles} columns={2} compact />
          ) : null}

          {pagination ? (
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setSearchParams({
                    group: activeGroup,
                    page: String(pagination.page - 1),
                  })
                }
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>

              <Button
                type="button"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setSearchParams({
                    group: activeGroup,
                    page: String(pagination.page + 1),
                  })
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
