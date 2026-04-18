import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import {
  getDashboardHistoryRequest,
  getDashboardOverviewRequest,
  getDashboardSocialRequest,
} from "@/features/dashboard/api/dashboard-api";
import {
  followUserRequest,
  unfollowUserRequest,
} from "@/features/profile/api/public-profile-api";
import { queryKeys } from "@/shared/api/query-keys";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardTab = "analytics" | "social" | "history";
type DashboardChartPoint = { day: number; label: string; viewsCount: number };

function toMonthLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

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
        <img
          src={avatar}
          alt={username}
          className="h-full w-full object-cover"
        />
      ) : (
        username.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function ViewsLineChart({
  data,
}: {
  data: DashboardChartPoint[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        No daily view data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 16, left: 6, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              allowDecimals={false}
              width={38}
            />
            <Tooltip
              cursor={{ stroke: "#86efac", strokeWidth: 2 }}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#d1d5db",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "#111827", fontWeight: 600 }}
              formatter={(value) => {
                const numericValue = Array.isArray(value) ? value[0] ?? 0 : value ?? 0;
                return [`${numericValue} views`, "Views"];
              }}
            />
            <Line
              type="monotone"
              dataKey="viewsCount"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 3, stroke: "#16a34a", fill: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#16a34a", fill: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
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
          label: toMonthLabel(currentYear, value),
        };
      }),
    [currentMonth, currentYear]
  );

  const renderAnalytics = () => {
    if (overviewQuery.isLoading) {
      return <p className="text-gray-500">Loading analytics...</p>;
    }
    if (overviewQuery.isError || !overviewQuery.data?.data) {
      return <p className="text-red-500">Failed to load analytics.</p>;
    }

    const overview = overviewQuery.data.data;
    const chartData = overview.dailyViews
      .filter((item) => item.day <= Math.min(currentDay, overview.dailyViews.length))
      .map((item) => ({
        day: item.day,
        viewsCount: item.viewsCount,
        label: `${item.day}d`,
      }));

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
          <ViewsLineChart data={chartData} />
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
                  <Link
                    to={`/profiles/${item.user.username}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <UserAvatar
                      username={item.user.username}
                      avatar={item.user.avatar}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 hover:text-green-600">
                        {item.user.username}
                      </p>
                      <p className="truncate text-xs text-gray-500">{item.user.email}</p>
                    </div>
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
                  <Link
                    to={`/profiles/${item.user.username}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <UserAvatar
                      username={item.user.username}
                      avatar={item.user.avatar}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 hover:text-green-600">
                        {item.user.username}
                      </p>
                      <p className="truncate text-xs text-gray-500">{item.user.email}</p>
                    </div>
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
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/articles/${item.article.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/articles/${item.article.slug}`);
                  }
                }}
                className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
              >
                <p className="text-lg font-semibold text-gray-900 hover:text-green-600">
                  {item.article.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  By{" "}
                  <Link
                    to={`/profiles/${item.article.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="group inline-flex font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span className="border-b border-transparent transition-colors group-hover:border-black">
                      {item.article.author.username}
                    </span>
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
