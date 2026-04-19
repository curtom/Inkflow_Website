import { cn } from "@/shared/lib/cn";
import { NavLink } from "react-router";
import { House, Settings, User, SquarePen, LayoutDashboard } from 'lucide-react';

type SidebarProps = {
    open: boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition",
        isActive ? "bg-green-50 font-medium text-green-600"
        : "text-gray-700 hover:bg-gray-100"
    );

export default function Sidebar({ open }: SidebarProps) {
    return (
         <aside
            className={cn(
                "sticky top-16 h-[calc(100vh-64px)] shrink-0 overflow-hidden border-r border-gray-200 bg-white transition-all duration-300",
                open ? "w-72" : "w-0"
              )}
            >
              <div className="h-full overflow-y-auto">
               <div className="border-b border-gray-200 px-5 py-4">
                <span className="text-xl font-semibold text-gray-900">Navigation</span>
                </div>
              
              <nav className="space-y-2 px-4 py-6">
                <NavLink to="/" className={linkClass} end>
                    <House className="w-5 h-5" />
                    Home
                </NavLink>

                <NavLink to="/profile" className={linkClass}>
                    <User className="w-5 h-5" />
                    Profile
                </NavLink>

                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </NavLink>

                <NavLink to="/editor" className={linkClass}>
                    <SquarePen className="w-5 h-5" />
                    Write
                </NavLink>

                <NavLink to="/settings" className={linkClass}>
                    <Settings className="w-5 h-5" />
                    Settings
                </NavLink>
               </nav>
              </div>
        </aside>
    );
}