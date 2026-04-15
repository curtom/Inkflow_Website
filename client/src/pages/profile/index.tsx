import { getMyArticlesRequest, getMyProfileRequest, getMyFavoriteArticlesRequest } from "@/features/profile/api/profile-api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";


export default function ProfilePage() {
    const [tab, setTab] = useState("published");

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

    const user = profileQuery.data?.data.user;
    const articles = articlesQuery.data?.data.articles ?? [];

    if(profileQuery.isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Loading profile...</div>
    }

    if(profileQuery.isError || !user) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Failed to load profile.</div>;
    }

    return (
       <div className="mx-auto max-w-5xl px-4 py-10">
         <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-3xl font-semibold text-white">
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
                    <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                    <p className="mt-1 text-gray-500">{user.email}</p>
                    <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {user.bio || "No bio yet."}
                    </p>
                </div>
            </div>
         </section>

         <section>
            <div className="mb-6 mt-6 flex gap-3 border-b border-gray-200 pb-3">
                <button
                    type="button"
                    onClick={() => setTab("published")}
                    className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer",
                    tab === "published"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                >
                    Favorites
                </button>
            </div>

            <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {tab === "published" ? "Published Articles" : "Favorite Articles"}
            </h2>
            {articlesQuery.isLoading ? <p>Loading posts...</p> : null}
            {articlesQuery.isError ? <p>Failed to load posts.</p> : null}
            {!articlesQuery.isLoading && !articlesQuery.isError ? (
            <ArticleList articles={articles} />
            ) : null}
         </section>
       </div>
    );
}