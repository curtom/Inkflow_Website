export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    users: {
        me: ["users", "me"] as const,
    },
    profile: {
        myArticles: (page: number, limit: number) =>
          ["profile", "my-articles", page, limit] as const,
        myFavorites: (page: number, limit: number) =>
          ["profile", "my-favorites", page, limit] as const,
      },
      publicProfile: {
        detail: (username: string) => ["public-profile", "detail", username] as const,
        articles: (username: string, page: number, limit: number, sort: string) =>
          ["public-profile", "articles", username, page, limit, sort] as const,
      },
    articles: {
        list: (page: number, limit: number, tag?: string) =>
            ["articles", "list", page, limit, tag ?? ""] as const,
        infiniteList: (limit: number, tag: string) =>
            ["articles", "infinite", limit, tag] as const,
        detail: (slug: string) => ["articles", "details", slug] as const,
        comments: (slug: string) => ["articles", "comments", slug] as const,
    },
    search: {
        overview: (keyword: string) => ["search", "overview", keyword] as const,
    },
    dashboard: {
        overview: (month?: number) => ["dashboard", "overview", month ?? "current"] as const,
        social: ["dashboard", "social"] as const,
        history: (page: number, limit: number) => ["dashboard", "history", page, limit] as const,
        notifications: (limit: number) => ["dashboard", "notifications", limit] as const,
        notificationsUnread: ["dashboard", "notifications-unread"] as const,
    },
};