import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  getDashboardNotificationsRequest,
  postNotificationsMarkViewedRequest,
} from "@/features/dashboard/api/dashboard-api";
import { queryKeys } from "@/shared/api/query-keys";
import { cn } from "@/shared/lib/cn";

const ACTIVITY_LIMIT = 50;

type NotificationsTab = "interaction" | "followers";

function UserAvatar({
  username,
  avatar,
}: {
  username: string;
  avatar?: string;
}) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-sm font-semibold text-white">
      {avatar ? (
        <img src={avatar} alt={username} className="h-full w-full object-cover" />
      ) : (
        username.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<NotificationsTab>("interaction");

  useEffect(() => {
    void postNotificationsMarkViewedRequest().then(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.notificationsUnread });
    });
  }, [queryClient]);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard.notifications(ACTIVITY_LIMIT),
    queryFn: () => getDashboardNotificationsRequest(ACTIVITY_LIMIT),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-gray-500">加载通知中…</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-500">无法加载通知。</p>
      </div>
    );
  }

  const { interaction, followNotifications, followers } = data.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">消息通知</h1>

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("interaction")}
          className={cn(
            "border-b-2 px-4 py-3 text-sm font-semibold transition",
            tab === "interaction"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          互动
          <span className="ml-1 font-normal text-gray-500">
            （点赞 · 收藏 · 评论 · 关注的人发帖）
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("followers")}
          className={cn(
            "border-b-2 px-4 py-3 text-sm font-semibold transition",
            tab === "followers"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          新增粉丝
        </button>
      </div>

      {tab === "interaction" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {interaction.length === 0 ? (
              <p className="text-sm text-gray-500">
                暂无点赞、收藏、评论或关注的人发帖通知。
              </p>
            ) : (
              interaction.map((item) => {
                if (item.kind === "comment") {
                  return (
                    <Link
                      key={`comment-${item.id}`}
                      to={`/articles/${encodeURIComponent(item.article.slug)}`}
                      className="flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                    >
                      <UserAvatar username={item.actor.username} avatar={item.actor.avatar} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{item.actor.username}</span>
                          <span className="text-gray-600"> 评论了你的文章</span>
                          <span className="font-medium text-green-700"> 《{item.article.title}》</span>
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">{item.excerpt}</p>
                        <p className="mt-1 text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                      </div>
                    </Link>
                  );
                }

                if (item.kind === "following_post") {
                  return (
                    <Link
                      key={`following_post-${item.actor.id}-${item.article.slug}-${item.createdAt}`}
                      to={`/articles/${encodeURIComponent(item.article.slug)}`}
                      className="flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                    >
                      <UserAvatar username={item.actor.username} avatar={item.actor.avatar} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{item.actor.username}</span>
                          <span className="text-gray-600"> 发布了新文章</span>
                          <span className="font-medium text-green-700"> 《{item.article.title}》</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                      </div>
                    </Link>
                  );
                }

                const verb = item.kind === "like" ? "赞了你的文章" : "收藏了你的文章";
                return (
                  <Link
                    key={`${item.kind}-${item.actor.id}-${item.article.slug}-${item.createdAt}`}
                    to={`/articles/${encodeURIComponent(item.article.slug)}`}
                    className="flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                  >
                    <UserAvatar username={item.actor.username} avatar={item.actor.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{item.actor.username}</span>
                        <span className="text-gray-600"> {verb}</span>
                        <span className="font-medium text-green-700"> 《{item.article.title}》</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">粉丝动态</h2>
            <div className="space-y-3">
              {followNotifications.length === 0 ? (
                <p className="text-sm text-gray-500">暂无新的关注记录。</p>
              ) : (
                followNotifications.map((item) => (
                  <Link
                    key={`follow-${item.actor.id}-${item.createdAt}`}
                    to={`/profiles/${encodeURIComponent(item.actor.username)}`}
                    className="flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                  >
                    <UserAvatar username={item.actor.username} avatar={item.actor.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{item.actor.username}</span>
                        <span className="text-gray-600"> 关注了你</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">关注你的人（{followers.length}）</h2>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {followers.length === 0 ? (
                <p className="text-sm text-gray-500">还没有人关注你。</p>
              ) : (
                followers.map((item) => (
                  <Link
                    key={item.user.id}
                    to={`/profiles/${encodeURIComponent(item.user.username)}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                  >
                    <UserAvatar username={item.user.username} avatar={item.user.avatar} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{item.user.username}</p>
                      <p className="truncate text-xs text-gray-500">{formatTime(item.followedAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
