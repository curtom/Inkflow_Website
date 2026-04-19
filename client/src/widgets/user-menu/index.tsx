import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux";
import { clearCredentials } from "@/features/auth/model/auth-slice";
import { Link } from "react-router";

function getInitial(username?: string) {
  return username?.charAt(0).toUpperCase() || "U";
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(clearCredentials());
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-terracotta text-base font-medium text-ivory shadow-[0_0_0_1px_#c96442] transition hover:brightness-95"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
        ) : (
          getInitial(user?.username)
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-border-cream bg-ivory shadow-whisper">
          <div className="flex items-center gap-4 border-b border-border-cream p-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-terracotta text-xl font-medium text-ivory">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                getInitial(user?.username)
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-editorial text-lg font-medium text-ink">{user?.username}</p>
              <p className="truncate text-sm text-stone">{user?.email}</p>
            </div>
          </div>

          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-olive transition hover:bg-parchment hover:text-ink"
            >
              Profile
            </Link>

            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-olive transition hover:bg-parchment hover:text-ink"
            >
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-xl px-4 py-3 text-left text-error transition hover:bg-parchment"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
