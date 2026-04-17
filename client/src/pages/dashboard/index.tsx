import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  getDashboardHistoryRequest,
  getDashboardOverviewRequest,
  getDashboardSocialRequest,
} from "@/features/dashboard/api/dashboard-api";
import { queryKeys } from "@/shared/api/query-keys";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";

type DashboardTab = "analytics" | "social" | "history";

function toMonthLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function ViewsLineChart({
  data,
}: {
  data: Array<{ day: number; viewsCount: number }>;
}) {
  const width = 900;
  const height = 260;
  const paddingX = 36;
  const paddingY = 24;
  const maxY = Math.max(1, ...data.map((item) => item.viewsCount));
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((item, index) => {
    const x =
      data.length <= 1
        ? paddingX
        : paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (item.viewsCount / maxY) * chartHeight;
    return `${x},${y}`;
  });

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = Math.round((1 - ratio) * maxY);
    const y = paddingY + ratio * chartHeight;
    return { value, y };
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={paddingX}
              y1={tick.y}
              x2={width - paddingX}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={6}
              y={tick.y + 4}
              fontSize="11"
              fill="#6b7280"
              className="select-none"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {points.length > 0 ? (
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {data.map((item, index) => {
          const x =
            data.length <= 1
              ? paddingX
              : paddingX + (index / (data.length - 1)) * chartWidth;
          const y = paddingY + chartHeight - (item.viewsCount / maxY) * chartHeight;
          const showLabel = index === 0 || index === data.length - 1 || item.day % 5 === 0;
          return (
            <g key={item.day}>
              <circle cx={x} cy={y} r={3} fill="#16a34a" />
              {showLabel ? (
                <text
                  x={x}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  className="select-none"
                >
                  {item.day}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const [tab, setTab] = useState<DashboardTab>("analytics");
  const [historyPage, setHistoryPage] = useState(1);

  const overviewQuery = useQuery({
    queryKey: queryKeys.dashboard.overview(month),
    queryFn: () => getDashboardOverviewRequest(month),
    enabled: tab === "analytics",
  });

  const socialQuery = useQuery({
    queryKey: queryKeys.dashboard.social,
    queryFn: getDashboardSocialRequest,
    enabled: tab === "social",
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.dashboard.history(historyPage, 20),
    queryFn: () => getDashboardHistoryRequest(historyPage, 20),
    enabled: tab === "history",
  });

  const followMutation = useMutation({
    mutationFn: async (payload: { username: string; nextFollowing: boolean }) => {
      const { followUserRequest, unfollowUserRequest } = await import(
        "@/features/profile/api/public-profile-api"
      );
      if (payload.nextFollowing) {
        return followUserRequest(payload.username);
      }
      return unfollowUserRequest(payload.username);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.social });
    },
  });

  const monthOptions = useMemo(
    () =>
      Array.from({ length: currentMonth }, (_, index) => {
        const value = index + 1;
        return {
          value,
          label: toMonthLabel(now.getFullYear(), value),
        };
      }),
    [currentMonth, now]
  );

  const renderAnalytics = () => {
    if (overviewQuery.isLoading) {
      return <p className="text-gray-500">Loading analytics...</p>;
    }
    if (overviewQuery.isError || !overviewQuery.data?.data) {
      return <p className="text-red-500">Failed to load analytics.</p>;
    }

    const overview = overviewQuery.data.data;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Post Analytics</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Month:
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Views</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview.summary.viewsCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Comments</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview.summary.commentsCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Likes</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview.summary.likesCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Favorites</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview.summary.favoritesCount}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Daily Views</h3>
          <ViewsLineChart data={overview.dailyViews} />
        </div>
      </div>
    );
  };

  const renderSocial = () => {
    if (socialQuery.isLoading) {
      return <p className="text-gray-500">Loading social data...</p>;
    }
    if (socialQuery.isError || !socialQuery.data?.data) {
      return <p className="text-red-500">Failed to load social data.</p>;
    }

    const social = socialQuery.data.data;
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Following ({social.following.length})</h2>
          <div className="space-y-3">
            {social.following.length === 0 ? (
              <p className="text-sm text-gray-500">No following users.</p>
            ) : (
              social.following.map((item) => (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <Link to={`/profiles/${item.user.username}`} className="min-w-0">
                    <p className="font-medium text-gray-900 hover:text-green-600">{item.user.username}</p>
                    <p className="truncate text-xs text-gray-500">{item.user.email}</p>
                  </Link>
                  <Button
                    type="button"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    loading={
                      followMutation.isPending &&
                      followMutation.variables?.username === item.user.username
                    }
                    onClick={async () => {
                      await followMutation.mutateAsync({
                        username: item.user.username,
                        nextFollowing: false,
                      });
                    }}
                  >
                    Unfollow
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Followers ({social.followers.length})</h2>
          <div className="space-y-3">
            {social.followers.length === 0 ? (
              <p className="text-sm text-gray-500">No followers yet.</p>
            ) : (
              social.followers.map((item) => (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <Link to={`/profiles/${item.user.username}`} className="min-w-0">
                    <p className="font-medium text-gray-900 hover:text-green-600">{item.user.username}</p>
                    <p className="truncate text-xs text-gray-500">{item.user.email}</p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderHistory = () => {
    if (historyQuery.isLoading) {
      return <p className="text-gray-500">Loading history...</p>;
    }
    if (historyQuery.isError || !historyQuery.data?.data) {
      return <p className="text-red-500">Failed to load history.</p>;
    }

    const history = historyQuery.data.data;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">View History</h2>
        {history.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No view history yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.items.map((item) => (
              <div
                key={item.article.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <Link
                  to={`/articles/${item.article.slug}`}
                  className="text-lg font-semibold text-gray-900 hover:text-green-600"
                >
                  {item.article.title}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  By{" "}
                  <Link
                    to={`/profiles/${item.article.author.username}`}
                    className="font-medium text-gray-700 hover:text-green-600"
                  >
                    {item.article.author.username}
                  </Link>
                </p>
                <p className="mt-2 text-sm text-gray-600">{item.article.summary}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Views recorded: {item.viewsCount}</span>
                  <span>Last viewed: {new Date(item.lastViewedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={history.pagination.page <= 1}
            onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {history.pagination.page} / {history.pagination.totalPages || 1}
          </span>
          <Button
            type="button"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={history.pagination.page >= history.pagination.totalPages}
            onClick={() => setHistoryPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap gap-3 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "analytics"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => setTab("social")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "social"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Social
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "history"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          History
        </button>
      </div>

      {tab === "analytics" ? renderAnalytics() : null}
      {tab === "social" ? renderSocial() : null}
      {tab === "history" ? renderHistory() : null}
    </div>
  );
}
