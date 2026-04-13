import { Link } from "react-router"
import type {Article} from "@/entities/article";

type Props = {
    article: Article
};

export default function ArticleCard({ article }: Props ) {
    return (
        <Link
            to={`/articles/${article.slug}`}
            className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
        >
            <article>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            By {article.author.username} ·{" "}
                            {new Date(article.createdAt).toLocaleDateString()}
                        </p>
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
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}

                <p className="mt-4 text-sm font-medium text-green-600">
                    Read More →
                </p>
            </article>
        </Link>
    );
}