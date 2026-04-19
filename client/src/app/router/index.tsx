import { createBrowserRouter } from "react-router";
import MainLayout from "./main-layout";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFoundPage from "@/pages/not-found";
import ArticleDetailPage from "@/pages/article-detail";
import CreateArticlePage from "@/pages/editor/create-article-page";
import EditArticlePage from "@/pages/editor/edit-article-page";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile";
import { GuestRoute, ProtectedRoute } from "./route-guards";
import SearchPage from "@/pages/search";
import PublicProfilePage from "@/pages/public-profile";
import DashboardPage from "@/pages/dashboard";
import CommunityPage from "@/pages/community";
import NotificationsPage from "@/pages/notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "communities/:communityId", element: <CommunityPage /> },
      { path: "profiles/:username", element: <PublicProfilePage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
      { path: "articles/:slug", element: <ArticleDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "editor", element: <CreateArticlePage /> },
          { path: "editor/:slug", element: <EditArticlePage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "dashboard", element: <DashboardPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);