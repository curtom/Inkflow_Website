import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "@/shared/hooks/redux";
import UserMenu from "@/widgets/user-menu";
import { Search, SquarePen } from 'lucide-react';

type NavbarProps = {
  onToggleSidebar: () => void;
};

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const keyword = searchValue.trim();

    if(!keyword) return;

    navigate(`/search?q=${encodeURIComponent(keyword)}&tab=stories`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-xl">☰</span>
          </button>

          <Link to="/" className="text-3xl font-bold tracking-tight text-gray-900">
            InkFlow
          </Link>

          <form onSubmit={handleSubmit} className="hidden md:block">
            <div className="flex w-80 items-center rounded-full bg-gray-100 px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                 type="text"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
                 placeholder="Search..."
                 className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
               />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/editor"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 md:inline-flex"
              >
                <SquarePen className="w-5 h-5" />
                Write
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
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