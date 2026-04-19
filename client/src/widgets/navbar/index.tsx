import { type FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { getNotificationsUnreadRequest } from "@/features/dashboard/api/dashboard-api";
import { queryKeys } from "@/shared/api/query-keys";
import { useAppSelector } from "@/shared/hooks/redux";
import UserMenu from "@/widgets/user-menu";
import { Bell, Search, SquarePen } from "lucide-react";

type NavbarProps = {
  onToggleSidebar: () => void;
};

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [searchValue, setSearchValue] = useState("");

  const unreadQuery = useQuery({
    queryKey: queryKeys.dashboard.notificationsUnread,
    queryFn: getNotificationsUnreadRequest,
    enabled: isAuthenticated,
  });
  const unreadCount = unreadQuery.data?.data?.unreadCount ?? 0;
  const unreadBadge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const keyword = searchValue.trim();

    if (!keyword) return;

    navigate(`/search?q=${encodeURIComponent(keyword)}&tab=stories`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-dark-surface/15 bg-ivory/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(240,238,230,0.8)]">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-olive transition hover:bg-warm-sand hover:text-ink"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl leading-none">☰</span>
          </button>

          <Link
            to="/"
            className="font-editorial text-2xl font-medium tracking-tight text-ink md:text-3xl"
          >
            InkFlow
          </Link>

          <form onSubmit={handleSubmit} className="hidden md:block">
            <div className="flex w-80 items-center rounded-full border border-border-cream bg-parchment px-4 py-2 shadow-[0_0_0_1px_#f0eee6]">
              <Search className="h-5 w-5 shrink-0 text-stone" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/editor"
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-dark-warm transition hover:bg-warm-sand md:inline-flex"
              >
                <SquarePen className="h-5 w-5" />
                Write
              </Link>
              <Link
                to="/notifications"
                className="relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-dark-warm transition hover:bg-warm-sand"
                title="消息通知"
                aria-label={
                  unreadCount > 0 ? `消息通知，${unreadCount} 条未读` : "消息通知"
                }
              >
                <span className="relative inline-flex">
                  <Bell className="h-5 w-5" />
                  {unreadBadge ? (
                    <span
                      className="absolute -right-2.5 -top-2 min-h-5 min-w-5 rounded-full bg-error px-1 text-center text-[10px] font-semibold leading-5 text-ivory shadow-[0_0_0_1px_#b53333] tabular-nums"
                      aria-hidden
                    >
                      {unreadBadge}
                    </span>
                  ) : null}
                </span>
                <span className="hidden sm:inline">通知</span>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-olive transition hover:bg-warm-sand hover:text-ink"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-terracotta px-4 py-2 text-sm font-medium text-ivory shadow-[0_0_0_1px_#c96442] transition hover:brightness-95"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
