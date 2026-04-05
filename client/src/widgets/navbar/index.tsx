import { Link, NavLink, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux";
import { clearCredentials } from "@/features/auth/model/auth-slice";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
        ? "font-medium text-green-600"
        : "text-gray-600 transition hover:text-gray-900";

export default function Navbar() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(clearCredentials());
        navigate("/");
    };

    return (
        <header className="border-b border-gray-200 bg-white fixed w-full">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="text-2xl font-bold text-green-600">
                    InkFlow
                </Link>

                <nav className="flex items-center gap-6">
                    <NavLink to="/" className={navLinkClass} end>
                        Home
                    </NavLink>

                    {!isAuthenticated ? (
                        <>
                            <NavLink to="/login" className={navLinkClass}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={navLinkClass}>
                                Register
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/editor" className={navLinkClass}>
                                Write
                            </NavLink>
                            <span className="text-sm text-gray-700">
                Hi, {user?.username || "User"}
              </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-500 transition hover:text-red-600"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}