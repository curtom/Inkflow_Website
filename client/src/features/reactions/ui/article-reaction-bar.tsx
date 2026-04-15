import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/shared/hooks/redux";
import { toggleFavoriteArticleRequest, toggleLikeArticleRequest } from "@/features/reactions/api/reaction-api";
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

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
   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

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
      <div className="mt-5 flex items-center justify-end gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
         <button
           type="button"
           disabled={!isAuthenticated || likeMutation.isPending}
           onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                 window.alert("Please login to like this article");
                 return;
              }
              await likeMutation.mutateAsync();
           }}
           className="inline-flex items-center gap-1 transition hover:text-gray-800 disabled:opacity-60 cursor-pointer"
         >
            <Heart
              className="w-5 h-5 transition-colors"
              fill={isLiked ? "currentColor" : "none"}
              strokeWidth={isLiked ? 0 : 2}
            />
            <span>{likesCount}</span>
         </button>

         <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-5 h-5" />
            <span>{commentsCount}</span>
         </span>

        <button
          type="button"
          disabled={!isAuthenticated || favoriteMutation.isPending}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
               window.alert("Please login to favorite this article");
               return;
            }
            await favoriteMutation.mutateAsync();
          }}
          className="inline-flex items-center gap-1 transition hover:text-gray-800 disabled:opacity-60 cursor-pointer"
        >
            <Bookmark
              className="w-5 h-5 transition-colors"
              fill={isFavorited ? "currentColor" : "none"}
              strokeWidth={isFavorited ? 0 : 2}
            />
            <span>{favoritesCount}</span>
        </button>
      </div>
   );
}