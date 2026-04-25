import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "@/shared/hooks/redux";
import {
  toggleFavoriteArticleRequest,
  toggleLikeArticleRequest,
} from "@/features/reactions/api/reaction-api";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

type Props = {
  slug: string;
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
};

export default function ArticleReactionBar({
  slug,
  likesCount,
  commentsCount,
  favoritesCount,
  isLiked = false,
  isFavorited = false,
}: Props) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const goLogin = () => {
    void navigate("/login", { state: { from: location } });
  };

  const invalidateArticles = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
      queryClient.invalidateQueries({ queryKey: ["public-profile"] }),
    ]);

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeArticleRequest(slug),
    onSuccess: invalidateArticles,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteArticleRequest(slug),
    onSuccess: invalidateArticles,
  });

  return (
    <div className="mt-5 flex items-center justify-end gap-4 border-t border-border-cream pt-4 text-sm text-stone">
      <button
        type="button"
        disabled={likeMutation.isPending}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isAuthenticated) {
            goLogin();
            return;
          }
          await likeMutation.mutateAsync();
        }}
        className={`inline-flex cursor-pointer items-center gap-1 transition hover:text-terracotta disabled:opacity-60 ${
          isLiked ? "text-terracotta" : ""
        }`}
      >
        <Heart
          className="h-5 w-5 transition-colors"
          fill={isLiked ? "currentColor" : "none"}
          strokeWidth={isLiked ? 0 : 2}
        />
        <span>{likesCount}</span>
      </button>

      <span className="inline-flex items-center gap-1">
        <MessageCircle className="h-5 w-5" />
        <span>{commentsCount}</span>
      </span>

      <button
        type="button"
        disabled={favoriteMutation.isPending}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isAuthenticated) {
            goLogin();
            return;
          }
          await favoriteMutation.mutateAsync();
        }}
        className={`inline-flex cursor-pointer items-center gap-1 transition hover:text-coral disabled:opacity-60 ${
          isFavorited ? "text-coral" : ""
        }`}
      >
        <Bookmark
          className="h-5 w-5 transition-colors"
          fill={isFavorited ? "currentColor" : "none"}
          strokeWidth={isFavorited ? 0 : 2}
        />
        <span>{favoritesCount}</span>
      </button>
    </div>
  );
}
