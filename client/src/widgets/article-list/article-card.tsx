import { useNavigate } from "react-router";
import type { Article } from "@/entities/article";
import ArticleReactionBar from "@/features/reactions/ui/article-reaction-bar";
import { HashIcon, Pin } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  article: Article;
  compact?: boolean;
  /** On own profile, pin / unpin in the post list. */
  profilePin?: {
    show: boolean;
    isPinned: boolean;
    onToggle: () => void;
    busy?: boolean;
  };
};

export default function ArticleCard({ article, compact = false, profilePin }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/articles/${article.slug}`)}
      className={cn(
        "group block cursor-pointer rounded-2xl border border-border-cream bg-ivory shadow-whisper transition",
        "shadow-[0_0_0_1px_#f0eee6] hover:shadow-[0_0_0_1px_#d1cfc5,0_4px_24px_rgb(0_0_0/0.05)]",
        compact ? "p-4" : "p-5"
      )}
    >
      <article>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/profiles/${article.author.username}`);
                }}
                className="group/author flex cursor-pointer items-center gap-2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-terracotta text-xs font-medium text-ivory">
                  {article.author.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    article.author.username.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="text-sm text-stone transition group-hover/author:text-terracotta">
                  {article.author.username}
                </span>
              </button>
              <span className="text-sm text-stone">·</span>
              <span className="text-sm text-stone">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p
              className={cn(
                "mt-1 block font-editorial font-medium text-ink transition group-hover:text-terracotta",
                compact ? "text-lg leading-snug" : "text-xl leading-snug"
              )}
            >
              {article.title}
            </p>
            {article.isProfilePinned ? (
              <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-md bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
                <Pin className="h-3.5 w-3.5" aria-hidden />
                主页置顶
              </span>
            ) : null}
          </div>
          {profilePin?.show ? (
            <div className="shrink-0 self-start pt-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                disabled={profilePin.busy}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  profilePin.onToggle();
                }}
                className="rounded-lg border border-border-cream bg-parchment/90 px-2.5 py-1.5 text-xs font-medium text-olive transition hover:border-terracotta/30 hover:text-terracotta disabled:opacity-50"
              >
                {profilePin.isPinned ? "取消主页置顶" : "主页置顶"}
              </button>
            </div>
          ) : null}
        </div>

        <div className={cn("mt-4 flex items-start", compact ? "gap-4" : "gap-6")}>
          <p
            className={cn(
              "min-w-0 flex-1 text-olive",
              compact ? "max-h-[2.75rem] overflow-hidden text-sm leading-[1.375rem]" : "leading-[1.6]"
            )}
          >
            {article.summary}
          </p>
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className={cn(
                "shrink-0 rounded-xl object-cover shadow-[0_0_0_1px_#f0eee6]",
                compact ? "h-16 w-16" : "h-24 w-24"
              )}
            />
          ) : null}
        </div>

        {(() => {
          const tags = article.tags ?? [];
          if (tags.length === 0) {
            return null;
          }
          return (
            <div
              className={cn("mt-4 flex flex-wrap gap-2", compact ? "max-h-16 overflow-hidden" : "")}
            >
              {tags.slice(0, compact ? 3 : tags.length).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/?tag=${encodeURIComponent(tag)}`);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full bg-warm-sand text-charcoal transition",
                    "shadow-[0_0_0_1px_#d1cfc5] hover:brightness-95",
                    compact ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm"
                  )}
                >
                  <HashIcon className={compact ? "h-4 w-4" : "h-5 w-5"} />
                  {tag}
                </button>
              ))}
            </div>
          );
        })()}

        <ArticleReactionBar
          slug={article.slug}
          likesCount={article.likesCount}
          commentsCount={article.commentsCount}
          favoritesCount={article.favoritesCount}
          isLiked={article.isLiked}
          isFavorited={article.isFavorited}
        />
      </article>
    </div>
  );
}
