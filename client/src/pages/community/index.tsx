import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import ArticleFeedInfinite from "@/widgets/article-feed-infinite";
import { COMMUNITY_CONFIG_MAP, isCommunityId } from "@/features/community/lib/community-config";
import { cn } from "@/shared/lib/cn";

const COMMUNITY_FEED_LIMIT = 12;

export default function CommunityPage() {
  const { communityId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isValidCommunity = isCommunityId(communityId);
  const community = isValidCommunity ? COMMUNITY_CONFIG_MAP[communityId] : null;

  const groupKeyFromQuery = searchParams.get("group") || "";
  const activeGroup =
    community?.tabs.some((tab) => tab.key === groupKeyFromQuery)
      ? groupKeyFromQuery
      : community?.tabs[0]?.key ?? "";
  const activeTab = community?.tabs.find((tab) => tab.key === activeGroup);
  const activeTag = activeTab?.tag;

  const pageTitle = useMemo(() => {
    if (!community) {
      return "";
    }
    const activeGroupLabel = activeTab?.label ?? activeGroup;
    return `${community.title} · ${activeGroupLabel}`;
  }, [community, activeGroup, activeTab]);

  const [feedScrollEl, setFeedScrollEl] = useState<HTMLElement | null>(null);

  if (!community) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-error">Community not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] min-h-0 w-full max-w-8xl flex-col px-4 py-6">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3 sm:mb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-ink md:text-4xl">
            {community.title}
          </h1>
          <p className="mt-2 max-w-2xl text-lg leading-[1.6] text-olive">{community.description}</p>
          <p className="mt-1 text-sm text-stone">{pageTitle}</p>
        </div>
        <Link
          to="/"
          className="rounded-xl border border-border-cream bg-ivory px-4 py-2 text-sm font-medium text-charcoal shadow-[0_0_0_1px_#f0eee6] transition hover:bg-parchment"
        >
          Back to Home
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8">
        <aside className="shrink-0 self-start rounded-2xl border border-border-cream bg-ivory p-4 shadow-whisper">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone">Groups</h2>
          <div className="space-y-1">
            {community.tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSearchParams({ group: tab.key });
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                  activeGroup === tab.key
                    ? "bg-warm-sand text-terracotta shadow-[0_0_0_1px_#d1cfc5]"
                    : "text-olive hover:bg-parchment hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section
          ref={setFeedScrollEl}
          className="h-full min-h-0 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-mask-image:linear-gradient(180deg,transparent_0%,#fff_1.25rem,#fff_100%)] [mask-image:linear-gradient(180deg,transparent_0%,#fff_1.25rem,#fff_100%)] [mask-size:100%_100%] [mask-repeat:no-repeat]"
        >
          <ArticleFeedInfinite
            key={activeTag ?? ""}
            tag={activeTag}
            limit={COMMUNITY_FEED_LIMIT}
            columns={2}
            compact
            scrollRoot={feedScrollEl}
          />
        </section>
      </div>
    </div>
  );
}
