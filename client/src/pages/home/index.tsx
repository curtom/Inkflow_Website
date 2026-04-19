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
          <div className="sticky top-16 z-10 -mx-4 mb-8 flex items-start justify-between gap-4 bg-parchment/90 px-4 pb-4 pt-2 backdrop-blur-sm">
            <div>
              <h1 className="font-editorial text-4xl font-medium text-ink md:text-5xl">
                {tag ? `Tag: ${tag}` : "Home"}
              </h1>
              <p className="mt-2 max-w-xl text-lg leading-[1.6] text-olive">
                {tag
                  ? "Showing articles filtered by topic."
                  : "Explore ideas, stories, and knowledge from creators."}
              </p>
            </div>

            {tag ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearchParams({});
                }}
              >
                Clear Filter
              </Button>
            ) : null}
          </div>

          <ArticleFeedInfinite tag={tag || undefined} limit={HOME_FEED_LIMIT} compact />
        </section>

        <aside className="sticky top-20 h-fit space-y-4 rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
          <h2 className="font-editorial text-xl font-medium text-ink">Communities</h2>
          <p className="text-sm leading-[1.6] text-olive">
            Discover topic-based communities. Posts are organized by tags.
          </p>
          <div className="space-y-3">
            {communities.map((community) => {
              const Icon = community.icon;
              return (
                <Link
                  key={community.id}
                  to={`/communities/${community.id}`}
                  className="flex items-start gap-3 rounded-xl border border-border-cream bg-parchment/40 p-3 shadow-[0_0_0_1px_#f0eee6] transition hover:border-border-warm hover:bg-warm-sand/40"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warm-sand text-charcoal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{community.title}</span>
                    <span className="mt-1 block text-xs leading-[1.5] text-stone">
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
