import { createBrowserRouter } from "react-router";
import MainLayout from "./main-layout";
import { GuestRoute, ProtectedRoute } from "./route-guards";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  ArticleDetailPage,
  CreateArticlePage,
  EditArticlePage,
  SettingsPage,
  ProfilePage,
  SearchPage,
  PublicProfilePage,
  DashboardPage,
  CommunityPage,
  NotificationsPage,
} from "./lazy-pages";

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
