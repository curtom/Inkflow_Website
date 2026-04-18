import { useNavigate } from "react-router"
import type {Article} from "@/entities/article";
import ArticleReactionBar from "@/features/reactions/ui/article-reaction-bar";
import { HashIcon } from 'lucide-react';
import { cn } from "@/shared/lib/cn";

type Props = {
    article: Article;
    compact?: boolean;
};

export default function ArticleCard({ article, compact = false }: Props ) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/articles/${article.slug}`)}
            className={cn(
                "block rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-green-300 hover:shadow-md cursor-pointer",
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
                                className="flex items-center gap-2 group/author cursor-pointer"
                            >
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-xs font-semibold text-white">
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
                                <span className="text-sm text-gray-500 group-hover/author:text-green-600 transition">
                                    {article.author.username}
                                </span>
                            </button>
                            <span className="text-sm text-gray-400">·</span>
                            <span className="text-sm text-gray-400">
                                {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={cn(
                            "mt-1 block font-semibold text-gray-900 group-hover:text-green-600",
                            compact ? "text-lg" : "text-xl"
                        )}>
                            {article.title}
                        </p>
                    </div>
                </div>

                <div className={cn("flex items-start mt-4", compact ? "gap-4" : "gap-6")}>
                    <p className={cn(
                        "text-gray-600 flex-1 min-w-0",
                        compact ? "max-h-[2.75rem] overflow-hidden text-sm leading-[1.375rem]" : ""
                    )}>
                        {article.summary}
                    </p>
                    {article.coverImage && (
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className={cn(
                                "flex-shrink-0 rounded-xl object-cover",
                                compact ? "h-16 w-16" : "h-24 w-24"
                            )}
                        />
                    )}
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
                                    "rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 cursor-pointer flex items-center gap-1.5",
                                    compact ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm"
                                )}
                            >
                                <HashIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
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