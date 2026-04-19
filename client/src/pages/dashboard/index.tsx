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
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-terracotta text-sm font-semibold text-ivory">
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
      <div className="rounded-2xl border border-border-cream bg-ivory p-6 text-sm text-stone shadow-whisper">
        No daily view data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-cream bg-ivory p-4 shadow-whisper">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 16, left: 6, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e8e6dc" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#87867f" }}
              tickLine={false}
              axisLine={{ stroke: "#e8e6dc" }}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#87867f" }}
              tickLine={false}
              axisLine={{ stroke: "#e8e6dc" }}
              allowDecimals={false}
              width={38}
            />
            <Tooltip
              cursor={{ stroke: "#c96442", strokeWidth: 2, strokeOpacity: 0.35 }}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#f0eee6",
                boxShadow: "0 8px 30px rgb(0 0 0 / 0.06)",
                background: "#faf9f5",
              }}
              labelStyle={{ color: "#141413", fontWeight: 600 }}
              formatter={(value) => {
                const numericValue = Array.isArray(value) ? value[0] ?? 0 : value ?? 0;
                return [`${numericValue} views`, "Views"];
              }}
            />
            <Line
              type="monotone"
              dataKey="viewsCount"
              stroke="#c96442"
              strokeWidth={3}
              dot={{ r: 3, stroke: "#c96442", fill: "#faf9f5", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#c96442", fill: "#faf9f5", strokeWidth: 2 }}
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
      return <p className="text-stone">Loading analytics...</p>;
    }
    if (overviewQuery.isError || !overviewQuery.data?.data) {
      return <p className="text-error">Failed to load analytics.</p>;
    }

    const overview = overviewQuery.data.data;
    const isViewingCurrentMonth = month === currentMonth;
    const chartData = overview.dailyViews
      .filter((item) => (isViewingCurrentMonth ? item.day <= currentDay : true))
      .map((item) => ({
        day: item.day,
        viewsCount: item.viewsCount,
        label: `${item.day}d`,
      }));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-ink">Post Analytics</h2>
          <label className="flex items-center gap-2 text-sm text-charcoal">
            Month:
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-border-warm bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/25"
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
          <div className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
            <p className="text-sm text-stone">Views</p>
            <p className="mt-2 text-3xl font-bold text-ink">{overview.summary.viewsCount}</p>
          </div>
          <div className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
            <p className="text-sm text-stone">Comments</p>
            <p className="mt-2 text-3xl font-bold text-ink">{overview.summary.commentsCount}</p>
          </div>
          <div className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
            <p className="text-sm text-stone">Likes</p>
            <p className="mt-2 text-3xl font-bold text-ink">{overview.summary.likesCount}</p>
          </div>
          <div className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
            <p className="text-sm text-stone">Favorites</p>
            <p className="mt-2 text-3xl font-bold text-ink">{overview.summary.favoritesCount}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-ink">Daily Views</h3>
          <ViewsLineChart data={chartData} />
        </div>
      </div>
    );
  };

  const renderSocial = () => {
    if (socialQuery.isLoading) {
      return <p className="text-stone">Loading social data...</p>;
    }
    if (socialQuery.isError || !socialQuery.data?.data) {
      return <p className="text-error">Failed to load social data.</p>;
    }

    const social = socialQuery.data.data;
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
          <h2 className="mb-4 text-xl font-bold text-ink">Following ({social.following.length})</h2>
          <div className="space-y-3">
            {social.following.length === 0 ? (
              <p className="text-sm text-stone">No following users.</p>
            ) : (
              social.following.map((item) => (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-cream p-3"
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
                      <p className="font-medium text-ink hover:text-terracotta">
                        {item.user.username}
                      </p>
                      <p className="truncate text-xs text-stone">{item.user.email}</p>
                    </div>
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
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

        <section className="rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper">
          <h2 className="mb-4 text-xl font-bold text-ink">Followers ({social.followers.length})</h2>
          <div className="space-y-3">
            {social.followers.length === 0 ? (
              <p className="text-sm text-stone">No followers yet.</p>
            ) : (
              social.followers.map((item) => (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-cream p-3"
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
                      <p className="font-medium text-ink hover:text-terracotta">
                        {item.user.username}
                      </p>
                      <p className="truncate text-xs text-stone">{item.user.email}</p>
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
      return <p className="text-stone">Loading history...</p>;
    }
    if (historyQuery.isError || !historyQuery.data?.data) {
      return <p className="text-error">Failed to load history.</p>;
    }

    const history = historyQuery.data.data;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-ink">View History</h2>
        {history.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-warm bg-ivory p-8 text-center text-stone">
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
                className="cursor-pointer rounded-2xl border border-border-cream bg-ivory p-5 shadow-whisper transition hover:border-terracotta/40 hover:shadow-whisper"
              >
                <p className="text-lg font-semibold text-ink hover:text-terracotta">
                  {item.article.title}
                </p>
                <p className="mt-1 text-sm text-stone">
                  By{" "}
                  <Link
                    to={`/profiles/${item.article.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="group inline-flex font-medium text-charcoal hover:text-ink"
                  >
                    <span className="border-b border-transparent transition-colors group-hover:border-ink">
                      {item.article.author.username}
                    </span>
                  </Link>
                </p>
                <p className="mt-2 text-sm text-charcoal">{item.article.summary}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone">
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
            variant="secondary"
            disabled={history.pagination.page <= 1}
            onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-charcoal">
            Page {history.pagination.page} / {history.pagination.totalPages || 1}
          </span>
          <Button
            type="button"
            variant="secondary"
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
      <div className="mb-6 flex flex-wrap gap-3 border-b border-border-cream pb-4">
        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "analytics"
              ? "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
              : "bg-warm-sand text-charcoal hover:brightness-[0.97]"
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
              ? "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
              : "bg-warm-sand text-charcoal hover:brightness-[0.97]"
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
              ? "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
              : "bg-warm-sand text-charcoal hover:brightness-[0.97]"
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
