export const ENDPOINTS = {
    auth: {
        register: "/auth/register",
        login: "/auth/login",
        me: "/auth/me",
    },
    users: {
        me: "/users/me",
        updateMe: "/users/me",
    },
    articles: {
        list: "/articles",
        create: "/articles",
        detail: (slug: string) => `/articles/${slug}`,
        update: (slug: string) => `/articles/${slug}`,
        delete: (slug: string) => `/articles/${slug}`,
    },
};