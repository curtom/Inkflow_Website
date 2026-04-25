import {
  getMyArticlesRequest,
  getMyProfileRequest,
  getMyFavoriteArticlesRequest,
  setProfilePinnedArticleRequest,
} from "@/features/profile/api/profile-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { mergeProfileArticleList } from "@/shared/lib/merge-profile-articles";


export default function ProfilePage() {
    const [tab, setTab] = useState("published");
    const queryClient = useQueryClient();

    const profileQuery = useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMyProfileRequest,
    });

    const articlesQuery = useQuery({
        queryKey:
         tab === "published"
        ? queryKeys.profile.myArticles(1, 10) : queryKeys.profile.myFavorites(1, 10),
        queryFn: () => 
          tab === "published"
        ? getMyArticlesRequest(1, 10) : getMyFavoriteArticlesRequest(1, 10),
    });

    const profilePinMutation = useMutation({
        mutationFn: (articleId: string | null) => setProfilePinnedArticleRequest(articleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["profile", "my-articles"] });
            const username = profileQuery.data?.data.user?.username;
            if (username) {
                await queryClient.invalidateQueries({
                    queryKey: ["public-profile", "articles", username],
                });
            }
        },
    });

    const user = profileQuery.data?.data.user;
    const publishedData = tab === "published" ? articlesQuery.data?.data : undefined;
    const articles =
        tab === "published"
            ? mergeProfileArticleList(1, publishedData?.pinnedArticle ?? null, publishedData?.articles ?? [])
            : (articlesQuery.data?.data.articles ?? []).map((a) => ({ ...a, isProfilePinned: false }));

    if(profileQuery.isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Loading profile...</div>
    }

    if(profileQuery.isError || !user) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Failed to load profile.</div>;
    }

    return (
       <div className="mx-auto max-w-5xl px-4 py-10">
         <section className="rounded-3xl border border-border-cream bg-ivory p-8 shadow-whisper">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-terracotta text-3xl font-semibold text-ivory">
                {user.avatar ? (
                    <img 
                      src={user.avatar}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                ) : (
                    user.username.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-medium text-ink">{user.username}</h1>
                    <p className="mt-1 text-stone">{user.email}</p>
                    <p className="mt-4 whitespace-pre-wrap text-charcoal">
                    {user.bio || "No bio yet."}
                    </p>
                </div>
            </div>
         </section>

         <section>
            <div className="mb-6 mt-6 flex gap-3 border-b border-border-cream pb-3">
                <button
                    type="button"
                    onClick={() => setTab("published")}
                    className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer",
                    tab === "published"
                        ? "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
                        : "bg-warm-sand text-charcoal hover:brightness-[0.97]"
                    )}
                >
                    Published
                </button>

                <button
                    type="button"
                    onClick={() => setTab("favorites")}
                    className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer",
                    tab === "favorites"
                        ? "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
                        : "bg-warm-sand text-charcoal hover:brightness-[0.97]"
                    )}
                >
                    Favorites
                </button>
            </div>

            <h2 className="mb-6 text-2xl font-medium text-ink">
                {tab === "published" ? "Published Articles" : "Favorite Articles"}
            </h2>
            {articlesQuery.isLoading ? <p>Loading posts...</p> : null}
            {articlesQuery.isError ? <p>Failed to load posts.</p> : null}
            {!articlesQuery.isLoading && !articlesQuery.isError ? (
            <ArticleList
                articles={articles}
                showProfilePinControls={tab === "published"}
                profilePinLoading={profilePinMutation.isPending}
                onProfilePin={(articleId) => {
                    profilePinMutation.mutate(articleId);
                }}
            />
            ) : null}
         </section>
       </div>
    );
}