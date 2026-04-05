import type {Article} from "@/entities/article";
import ArticleCard from "@/widgets/article-list/article-card.tsx";


type Props = {
    articles: Article[]
};

export default function ArticleList({ articles }: Props) {
    if(!articles.length) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                No articles found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}