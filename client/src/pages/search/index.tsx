import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { searchOverviewRequest } from "@/features/search/api/search-api";
import { queryKeys } from "@/shared/api/query-keys";
import ArticleReactionBar from "@/features/reactions/ui/article-reaction-bar";

type SearchTab = "stories" | "people" | "topics";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get("q") ?? "";
  const tab = (searchParams.get("tab") as SearchTab) || "stories";

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.search.overview(keyword),
    queryFn: () => searchOverviewRequest(keyword),
    enabled: Boolean(keyword.trim()),
  });

  const stories = data?.data.stories ?? [];
  const users = data?.data.users ?? [];
  const tags = data?.data.tags ?? [];

  const visibleTab = useMemo<SearchTab>(() => {
    if (tab === "people" || tab === "topics") return tab;
    return "stories";
  }, [tab]);

  const setTab = (nextTab: SearchTab) => {
    setSearchParams({
      q: keyword,
      tab: nextTab,
    });
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <h1 className="mb-8 text-5xl font-bold text-gray-900">
          Results for <span className="text-black">{keyword}</span>
        </h1>

        <div className="mb-8 flex flex-wrap gap-6 border-b border-gray-200 pb-3 text-lg">
          <button
            type="button"
            onClick={() => setTab("stories")}
            className={visibleTab === "stories" ? "font-semibold text-black" : "text-gray-500"}
          >
            Stories
          </button>
          <button
            type="button"
            onClick={() => setTab("people")}
            className={visibleTab === "people" ? "font-semibold text-black" : "text-gray-500"}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => setTab("topics")}
            className={visibleTab === "topics" ? "font-semibold text-black" : "text-gray-500"}
          >
            Topics
          </button>
        </div>

        {isLoading ? <p>Searching...</p> : null}
        {isError ? <p>Failed to load search results.</p> : null}

        {!isLoading && !isError && visibleTab === "stories" ? (
          <div className="space-y-10">
            {stories.length ? (
              stories.map((story) => (
                <article
                  key={story.id}
                  className="border-b border-gray-200 pb-8"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/profiles/${encodeURIComponent(story.author.username)}`}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-sm font-semibold text-white"
                    >
                      {story.author.avatar ? (
                        <img
                          src={story.author.avatar}
                          alt={story.author.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        story.author.username.charAt(0).toUpperCase()
                      )}
                    </Link>

                    <Link
                      to={`/profiles/${encodeURIComponent(story.author.username)}`}
                      className="text-sm font-medium text-gray-700 hover:text-green-600"
                    >
                      {story.author.username}
                    </Link>
                  </div>

                  <Link
                    to={`/articles/${story.slug}`}
                    className="mt-3 block text-4xl font-bold leading-tight text-gray-900 hover:text-green-600"
                  >
                    {story.title}
                  </Link>

                  <p className="mt-4 text-2xl leading-relaxed text-gray-600">
                    {story.summary}
                  </p>

                  <ArticleReactionBar
                    slug={story.slug}
                    likesCount={story.likesCount}
                    commentsCount={story.commentsCount}
                    favoritesCount={story.favoritesCount}
                  />
                </article>
              ))
            ) : (
              <p className="text-gray-500">No stories found.</p>
            )}
          </div>
        ) : null}

        {!isLoading && !isError && visibleTab === "people" ? (
          <div className="space-y-6">
            {users.length ? (
              users.map((user) => (
                <Link
                  key={user.id}
                  to={`/profiles/${encodeURIComponent(user.username)}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-lg font-semibold text-white">
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

                    <div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-gray-500">{user.email}</p>
                      <p className="mt-1 text-gray-600">
                        {user.bio || "No bio yet."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No people found.</p>
            )}
          </div>
        ) : null}

        {!isLoading && !isError && visibleTab === "topics" ? (
          <div className="space-y-4">
            {tags.length ? (
              tags.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => navigate(`/?tag=${encodeURIComponent(tag.name)}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="text-lg font-medium text-gray-900">
                    #{tag.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tag.articleCount} articles
                  </span>
                </button>
              ))
            ) : (
              <p className="text-gray-500">No topics found.</p>
            )}
          </div>
        ) : null}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-10">
          <section>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Topics matching {keyword}
            </h2>

            <div className="flex flex-wrap gap-3">
              {tags.slice(0, 8).map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => navigate(`/?tag=${encodeURIComponent(tag.name)}`)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-base text-gray-800 transition hover:bg-gray-200"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              People matching {keyword}
            </h2>

            <div className="space-y-5">
              {users.slice(0, 5).map((user) => (
                <Link
                  key={user.id}
                  to={`/profiles/${encodeURIComponent(user.username)}`}
                  className="flex items-start gap-3 rounded-2xl p-2 transition hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-sm font-semibold text-white">
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

                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-gray-900">
                      {user.username}
                    </p>
                    <p className="truncate text-sm text-gray-500">{user.email}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {user.bio || "No bio yet."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}