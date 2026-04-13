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
    articles: {
        list: (page: number, limit: number) =>
            ["articles", "list", page, limit] as const,
        detail: (slug: string) => ["articles", "details", slug] as const,
        comments: (slug: string) => ["articles", "comments", slug] as const,
    },
};