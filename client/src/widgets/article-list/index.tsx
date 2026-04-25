import type { Article } from "@/entities/article";
import ArticleCard from "@/widgets/article-list/article-card.tsx";

type Props = {
  articles: Article[];
  compact?: boolean;
  columns?: 1 | 2;
  showProfilePinControls?: boolean;
  profilePinLoading?: boolean;
  onProfilePin?: (articleId: string | null) => void;
};

export default function ArticleList({
  articles,
  compact = false,
  columns = 1,
  showProfilePinControls = false,
  profilePinLoading = false,
  onProfilePin,
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
        <ArticleCard
          key={article.id}
          article={article}
          compact={compact}
          profilePin={
            showProfilePinControls && onProfilePin
              ? {
                  show: true,
                  isPinned: article.isProfilePinned ?? false,
                  busy: profilePinLoading,
                  onToggle: () => {
                    onProfilePin(article.isProfilePinned ? null : article.id);
                  },
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
