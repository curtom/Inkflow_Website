import { useSearchParams, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  getPublicProfileArticlesRequest,
  getPublicProfileRequest,
} from "@/features/profile/api/public-profile-api";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import Button from "@/shared/ui/button";


export default function PublicProfilePage() {
    const { username = ""} = useParams();
    const [searchParmas, setSearchParams] = useSearchParams();

    const page = Number(searchParmas.get("page") || "1");
    const limit = 10;

    const profileQuery = useQuery({
        queryKey: queryKeys.publicProfile.detail(username),
        queryFn: () => getPublicProfileRequest(username),
        enabled: Boolean(username),
    });

    const articlesQuery = useQuery({
        queryKey: queryKeys.publicProfile.articles(username, page, limit),
        queryFn: () => getPublicProfileArticlesRequest(username, page, limit),
        enabled: Boolean(username),
    });

    const user = profileQuery.data?.data.user;
    const articles = articlesQuery.data?.data.articles ?? [];
    const pagination = articlesQuery.data?.data.pagination;

    if(profileQuery.isLoading || articlesQuery.isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Loading profile...</div>
    }

    if(profileQuery.isError ||articlesQuery.isError || !user) {
        return <div className="mx-auto max-w-5xl px-4 py-10">Failed to load profile.</div>
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
  
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Published Posts</h2>
  
          <ArticleList articles={articles} />
  
          {pagination ? (
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setSearchParams({ page: String(pagination.page - 1) })
                }
              >
                Previous
              </Button>
  
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
  
              <Button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setSearchParams({ page: String(pagination.page + 1) })
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    );
}