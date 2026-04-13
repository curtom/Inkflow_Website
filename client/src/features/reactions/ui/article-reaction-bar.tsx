import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/shared/hooks/redux";
import { toggleFavoriteArticleRequest, toggleLikeArticleRequest } from "@/features/reactions/api/reaction-api";


type Props = {
    slug: string;
    likesCount: number;
    commentsCount: number;
    favoritesCount: number;
};

export default function ArticleReactionBar({
   slug,
   likesCount,
   commentsCount,
   favoritesCount,
}: Props) {
   const queryClient = useQueryClient();
   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

   const invalidateArticles = () =>
      Promise.all([
         queryClient.invalidateQueries({ queryKey: ["articles"] }),
         queryClient.invalidateQueries({ queryKey: ["profile"] }),
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
           className="inline-flex items-center gap-1 transition hover:text-gray-800 disabled:opacity-60"
         >
            <span>♡</span>
            <span>{likesCount}</span>
         </button>

         <span className="inline-flex items-center gap-1">
            <span>💬</span>
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
          className="inline-flex items-center gap-1 transition hover:text-gray-800 disabled:opacity-60"
        >
            <span>🔖</span>
            <span>{favoritesCount}</span>
        </button>
      </div>
   );
}