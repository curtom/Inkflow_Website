import { useSearchParams } from "react-router";
import ArticleFeedInfinite from "@/widgets/article-feed-infinite";
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

const HOME_FEED_LIMIT = 10;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_340px]">
        <section className="min-w-0">
          <div className="sticky top-16 z-10 -mx-4 mb-8 flex items-start justify-between gap-4 bg-gray-50 px-4 pb-4 pt-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{tag ? `Tag: ${tag}` : "Home"}</h1>
              <p className="mt-2 text-gray-600">
                {tag
                  ? "Showing articles filtered by topic."
                  : "Explore ideas, stories, and knowledge from creators."}
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

          <ArticleFeedInfinite
            tag={tag || undefined}
            limit={HOME_FEED_LIMIT}
            compact
          />
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
