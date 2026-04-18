import {useSearchParams} from "react-router";
import {queryKeys} from "@/shared/api/query-keys.ts";
import {useQuery} from "@tanstack/react-query";
import {getArticlesRequest} from "@/entities/article/api/article-api.ts";
import ArticleList from "@/widgets/article-list";
import Button from "@/shared/ui/button.tsx";
import { Link } from "react-router";
import { MessageSquareText, Wrench, Languages, Video } from "lucide-react";

const communities = [
  {
    id: "language-learning",
    title: "Language Learning Community",
    description: "Practice English, Chinese, Turkish and more.",
    icon: Languages,
  },
  {
    id: "tool-sharing",
    title: "Practical Tool Sharing",
    description: "Discover useful tools for work and life.",
    icon: Wrench,
  },
  {
    id: "daily-topic",
    title: "Daily Topic Discussion",
    description: "Talk about emotion, tech, AI and growth.",
    icon: MessageSquareText,
  },
  {
    id: "video-sharing",
    title: "Video Sharing Community",
    description: "Share and explore video focused posts.",
    icon: Video,
  },
];


export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") || "1");
    const tag = searchParams.get("tag") || "";
    const limit = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.articles.list(page, limit, tag),
        queryFn: () => getArticlesRequest(page, limit, tag || undefined),
    });

    const articles = data?.articles ?? [];
    const pagination = data?.pagination;

    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_340px]">
          <section className="min-w-0">
            <div className="sticky top-16 z-10 -mx-4 mb-8 flex items-start justify-between gap-4 bg-gray-50 px-4 pb-4 pt-2">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{tag ? `Tag: ${tag}` : "Home"}</h1>
                <p className="mt-2 text-gray-600">
                  {tag ? "Showing articles filtered by topic." : "Explore ideas, stories, and knowledge from creators."}
                </p>
              </div>

              {tag ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchParams({});
                  }}
                >
                  Clear Filter
                </Button>
              ) : null}
            </div>

            {isLoading ? <p>Loading articles...</p> : null}
            {isError ? <p>Failed to load articles</p> : null}
            {!isLoading && !isError ? <ArticleList articles={articles} compact /> : null}

            {pagination ? (
              <div className="mt-8 flex items-center justify-between">
                <Button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setSearchParams({ page: String(pagination.page - 1) })}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>

                <Button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setSearchParams({ page: String(pagination.page + 1) })}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </section>

          <aside className="sticky top-20 h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Communities</h2>
            <p className="text-sm text-gray-500">
              Discover topic-based communities. Posts are organized by tags.
            </p>
            <div className="space-y-3">
              {communities.map((community) => {
                const Icon = community.icon;
                return (
                  <Link
                    key={community.id}
                    to={`/communities/${community.id}`}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-300 hover:bg-green-50"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">
                        {community.title}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {community.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
}