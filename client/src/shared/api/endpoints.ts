export const ENDPOINTS = {
    auth: {
        register: "/auth/register",
        login: "/auth/login",
        me: "/auth/me",
    },
    users: {
        me: "/users/me",
        updateMe: "/users/me",
        profilePinnedArticle: "/users/me/profile-pinned-article",
    },
    profile: {
        myArticles: "/users/me/articles",
        myFavorites: "/users/me/favorites",
    },
    articles: {
        list: "/articles",
        create: "/articles",
        detail: (slug: string) => `/articles/${slug}`,
        update: (slug: string) => `/articles/${slug}`,
        delete: (slug: string) => `/articles/${slug}`,
    },
    publicProfile: {
      detail: (username: string) => `/profiles/${username}`,
      articles: (username: string) => `/profiles/${username}/articles`,
      follow: (username: string) => `/profiles/${username}/follow`,
    },
    comments: {
        list: (slug: string) => `/articles/${slug}/comments`,
        create: (slug: string) => `/articles/${slug}/comments`,
        delete: (slug: string, commentId: string) =>
          `/articles/${slug}/comments/${commentId}`,
        like: (slug: string, commentId: string) =>
          `/articles/${slug}/comments/${commentId}/like`,
        pin: (slug: string) => `/articles/${slug}/comments/pin`,
      },
      reactions: {
        like: (slug: string) => `/articles/${slug}/reactions/like`,
        favorite: (slug: string) => `/articles/${slug}/reactions/favorite`,
      },
      uploads: {
        image: "/uploads/image",
      },
      search: {
        overview: "/search",
      },
      dashboard: {
        overview: "/dashboard/overview",
        social: "/dashboard/social",
        history: "/dashboard/history",
        notifications: "/dashboard/notifications",
        notificationsUnread: "/dashboard/notifications/unread",
        notificationsMarkViewed: "/dashboard/notifications/mark-viewed",
      },
      community: {
        suggestTags: "/community/suggest-tags",
      },
};