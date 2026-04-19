import type { Article } from "@/entities/article";
import ArticleCard from "@/widgets/article-list/article-card.tsx";

type Props = {
  articles: Article[];
  compact?: boolean;
  columns?: 1 | 2;
};

export default function ArticleList({
  articles,
  compact = false,
  columns = 1,
}: Props) {
  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border-warm bg-ivory p-10 text-center text-stone shadow-[0_0_0_1px_#e8e6dc]">
        No articles found.
      </div>
    );
  }

  return (
    <div className={columns === 2 ? "grid grid-cols-1 gap-5 md:grid-cols-2" : "space-y-6"}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} compact={compact} />
      ))}
    </div>
  );
}
