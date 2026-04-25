import { useAppSelector } from "@/shared/hooks/redux.ts";
import { Navigate, Outlet, useLocation } from "react-router";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-redirect";

export function ProtectedRoute() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const location = useLocation();

    if(!isAuthenticated) {
        return <Navigate  to="/login" replace state={{from: location}}/>
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // Only redirect once the session is confirmed valid (user loaded from /me).
    // If a stale token is in storage but the bootstrap hasn't verified it yet,
    // user is still null, so we let the auth screens render normally.
    if (isAuthenticated && user !== null) {
        return <Navigate to={getPostAuthRedirectPath(location.state)} replace />;
    }

    return <Outlet />;
}