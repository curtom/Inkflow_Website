import { useNavigate } from "react-router"
import type {Article} from "@/entities/article";
import ArticleReactionBar from "@/features/reactions/ui/article-reaction-bar";
import { HashIcon } from 'lucide-react';

type Props = {
    article: Article
};

export default function ArticleCard({ article }: Props ) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/articles/${article.slug}`)}
            className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md cursor-pointer"
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
                        <p className="mt-1 block text-xl font-semibold text-gray-900 group-hover:text-green-600">
                            {article.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-6 mt-4">
                    <p className="text-gray-600 flex-1 min-w-0">
                        {article.summary}
                    </p>
                    {article.coverImage && (
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
                        />
                    )}
                </div>

                {article.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/?tag=${encodeURIComponent(tag)}`);
                                }}
                                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-200 cursor-pointer flex items-center gap-1.5"
                            >
                                <HashIcon className="w-5 h-5" />
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