import { useNavigate } from "react-router";
import type { Article } from "@/entities/article";
import ArticleReactionBar from "@/features/reactions/ui/article-reaction-bar";
import { HashIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  article: Article;
  compact?: boolean;
};

export default function ArticleCard({ article, compact = false }: Props) {
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
          </div>
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

        {article.tags.length > 0 ? (
          <div className={cn("mt-4 flex flex-wrap gap-2", compact ? "max-h-16 overflow-hidden" : "")}>
            {article.tags.slice(0, compact ? 3 : article.tags.length).map((tag) => (
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
        ) : null}

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
