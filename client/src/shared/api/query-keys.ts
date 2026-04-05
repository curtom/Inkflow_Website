export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    articles: {
        list: (page: number, limit: number) =>
            ["articles", "list", page, limit] as const,
        detail: (slug: string) => ["articles", "details", slug] as const,
    },
};