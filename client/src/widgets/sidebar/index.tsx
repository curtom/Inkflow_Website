import { cn } from "@/shared/lib/cn";
import { NavLink } from "react-router";
import { House, Settings, User, SquarePen, LayoutDashboard } from "lucide-react";

type SidebarProps = {
  open: boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-xl px-4 py-3 text-base transition",
    isActive
      ? "bg-warm-sand font-medium text-terracotta shadow-[0_0_0_1px_#d1cfc5]"
      : "text-olive hover:bg-parchment hover:text-ink"
  );

export default function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-64px)] shrink-0 overflow-hidden border-r border-border-cream bg-ivory transition-all duration-300",
        open ? "w-72" : "w-0"
      )}
    >
      <div className="h-full overflow-y-auto">
        <div className="border-b border-border-cream px-5 py-4">
          <span className="font-editorial text-lg font-medium text-ink">Navigation</span>
        </div>

        <nav className="space-y-1 px-3 py-5">
          <NavLink to="/" className={linkClass} end>
            <House className="h-5 w-5" />
            Home
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            <User className="h-5 w-5" />
            Profile
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink to="/editor" className={linkClass}>
            <SquarePen className="h-5 w-5" />
            Write
          </NavLink>

          <NavLink to="/settings" className={linkClass}>
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
