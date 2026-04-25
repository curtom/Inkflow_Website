import type { Location } from "react-router";

type AuthLocationState = { from?: Location | null };

/**
 * Resolves a safe in-app path to navigate to after login/register.
 * Only allows same-app paths; blocks open redirects and auth pages to avoid loops.
 */
export function getPostAuthRedirectPath(state: unknown): string {
  if (state == null || typeof state !== "object" || !("from" in state)) {
    return "/";
  }
  const from = (state as AuthLocationState).from;
  if (from == null || typeof from !== "object" || !("pathname" in from)) {
    return "/";
  }
  const pathname = (from as Location).pathname;
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return "/";
  }
  if (pathname === "/login" || pathname === "/register") {
    return "/";
  }
  const search = typeof (from as Location).search === "string" ? (from as Location).search : "";
  const hash = typeof (from as Location).hash === "string" ? (from as Location).hash : "";
  return `${pathname}${search}${hash}`;
}
