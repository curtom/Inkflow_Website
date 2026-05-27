import { lazy } from "react";

export const HomePage = lazy(() => import("@/pages/home"));
export const LoginPage = lazy(() => import("@/pages/login"));
export const RegisterPage = lazy(() => import("@/pages/register"));
export const NotFoundPage = lazy(() => import("@/pages/not-found"));
export const ArticleDetailPage = lazy(() => import("@/pages/article-detail"));
export const CreateArticlePage = lazy(() => import("@/pages/editor/create-article-page"));
export const EditArticlePage = lazy(() => import("@/pages/editor/edit-article-page"));
export const SettingsPage = lazy(() => import("@/pages/settings"));
export const ProfilePage = lazy(() => import("@/pages/profile"));
export const SearchPage = lazy(() => import("@/pages/search"));
export const PublicProfilePage = lazy(() => import("@/pages/public-profile"));
export const DashboardPage = lazy(() => import("@/pages/dashboard"));
export const CommunityPage = lazy(() => import("@/pages/community"));
export const NotificationsPage = lazy(() => import("@/pages/notifications"));
