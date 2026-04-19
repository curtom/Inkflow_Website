import { useParams, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followUserRequest,
  getPublicProfileArticlesRequest,
  getPublicProfileRequest,
  unfollowUserRequest,
  type PublicProfileArticlesSort,
} from "@/features/profile/api/public-profile-api";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleList from "@/widgets/article-list";
import Button from "@/shared/ui/button";
import PostsPaginationBar from "@/shared/ui/posts-pagination-bar";
import { useAppSelector } from "@/shared/hooks/redux";
import { cn } from "@/shared/lib/cn";

function parseSort(raw: string | null): PublicProfileArticlesSort {
  return raw === "likes" ? "likes" : "newest";
}

export default function PublicProfilePage() {
  const { username = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const page = Number(searchParams.get("page") || "1");
  const sort = parseSort(searchParams.get("sort"));
  const limit = 10;

  const profileQuery = useQuery({
    queryKey: queryKeys.publicProfile.detail(username),
    queryFn: () => getPublicProfileRequest(username),
    enabled: Boolean(username),
  });

  const articlesQuery = useQuery({
    queryKey: queryKeys.publicProfile.articles(username, page, limit, sort),
    queryFn: () => getPublicProfileArticlesRequest(username, page, limit, sort),
    enabled: Boolean(username),
  });

  const followMutation = useMutation({
    mutationFn: () => followUserRequest(username),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.publicProfile.detail(username),
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-profile", "articles", username],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.social });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUserRequest(username),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.publicProfile.detail(username),
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-profile", "articles", username],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.social });
    },
  });

  const user = profileQuery.data?.data.user;
  const articles = articlesQuery.data?.data.articles ?? [];
  const pagination = articlesQuery.data?.data.pagination;
  const isSelf = currentUser?.username === username;
  const isMutating = followMutation.isPending || unfollowMutation.isPending;

  const setSort = (next: PublicProfileArticlesSort) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", "1");
      p.set("sort", next);
      return p;
    });
  };

  const goToPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      p.set("sort", sort);
      return p;
    });
  };

  if (profileQuery.isLoading || articlesQuery.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-10">Loading profile...</div>;
  }

  if (profileQuery.isError || articlesQuery.isError || !user) {
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
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>{user.followersCount} Followers</span>
              <span>{user.followingCount} Following</span>
            </div>
          </div>
          {!isSelf ? (
            <Button
              type="button"
              disabled={!isAuthenticated || isMutating}
              loading={isMutating}
              onClick={async () => {
                if (!isAuthenticated) {
                  window.alert("Please login to follow users.");
                  return;
                }

                if (user.isFollowing) {
                  await unfollowMutation.mutateAsync();
                } else {
                  await followMutation.mutateAsync();
                }
              }}
            >
              {user.isFollowing ? "Unfollow" : "Follow"}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Published Posts</h2>

          <div
            className="inline-flex shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm"
            role="group"
            aria-label="排序"
          >
            <button
              type="button"
              onClick={() => setSort("newest")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition cursor-pointer",
                sort === "newest"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              最新发布
            </button>
            <button
              type="button"
              onClick={() => setSort("likes")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition cursor-pointer",
                sort === "likes"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              点赞最多
            </button>
          </div>
        </div>

        <ArticleList articles={articles} />

        {pagination && pagination.totalPages > 0 ? (
          <PostsPaginationBar
            className="mt-10"
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
          />
        ) : null}
      </section>
    </div>
  );
}
