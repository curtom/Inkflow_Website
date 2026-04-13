import { getMyArticlesRequest } from "@/features/profile/api/profile-api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import { getMyProfileRequest } from "@/features/profile/api/profile-api";


export default function ProfilePage() {
    const profileQuery = useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMyProfileRequest,
    });

    const articlesQuery = useQuery({
        queryKey: queryKeys.profile.myArticles(1, 10),
        queryFn: () => getMyArticlesRequest(1, 10),
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
         <h2 className="mb-6 text-2xl font-bold text-gray-900">Published Posts</h2>
            {articlesQuery.isLoading ? <p>Loading posts...</p> : null}
            {articlesQuery.isError ? <p>Failed to load posts.</p> : null}
            {!articlesQuery.isLoading && !articlesQuery.isError ? (
            <ArticleList articles={articles} />
            ) : null}
         </section>
       </div>
    );
}