import { createBrowserRouter } from "react-router";
import MainLayout from "./main-layout";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFoundPage from "@/pages/not-found";
import ArticleDetailPage from "@/pages/article-detail";
import CreateArticlePage from "@/pages/editor/create-article-page";
import EditArticlePage from "@/pages/editor/edit-article-page";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "articles/:slug", element: <ArticleDetailPage /> },
            { path: "editor", element: <CreateArticlePage /> },
            { path: "editor/:slug", element: <EditArticlePage /> },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);