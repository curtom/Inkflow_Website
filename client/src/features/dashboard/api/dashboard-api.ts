import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";

type DashboardMonth = {
  value: number;
  label: string;
};

type DashboardOverviewResponse = {
  message: string;
  data: {
    year: number;
    month: number;
    availableMonths: DashboardMonth[];
    summary: {
      viewsCount: number;
      commentsCount: number;
      likesCount: number;
      favoritesCount: number;
    };
    dailyViews: Array<{
      day: number;
      viewsCount: number;
    }>;
  };
};

type DashboardSocialUser = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
};

type DashboardSocialResponse = {
  message: string;
  data: {
    following: Array<{
      user: DashboardSocialUser;
      followedAt: string;
    }>;
    followers: Array<{
      user: DashboardSocialUser;
      followedAt: string;
    }>;
  };
};

type DashboardHistoryItem = {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    author: DashboardSocialUser;
  };
  viewsCount: number;
  lastViewedAt: string;
};

type DashboardHistoryResponse = {
  message: string;
  data: {
    items: DashboardHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export async function getDashboardOverviewRequest(month?: number) {
  const params = month ? { month } : undefined;
  return (await api.get(ENDPOINTS.dashboard.overview, { params })) as unknown as DashboardOverviewResponse;
}

export async function getDashboardSocialRequest() {
  return (await api.get(ENDPOINTS.dashboard.social)) as unknown as DashboardSocialResponse;
}

export async function getDashboardHistoryRequest(page = 1, limit = 20) {
  return (await api.get(ENDPOINTS.dashboard.history, { params: { page, limit } })) as unknown as DashboardHistoryResponse;
}

type NotificationUser = DashboardSocialUser;

type NotificationInteractionItem =
  | {
      kind: "like" | "favorite";
      createdAt: string;
      actor: NotificationUser;
      article: { slug: string; title: string };
    }
  | {
      kind: "comment";
      id: string;
      createdAt: string;
      actor: NotificationUser;
      article: { slug: string; title: string };
      excerpt: string;
    }
  | {
      kind: "following_post";
      createdAt: string;
      actor: NotificationUser;
      article: { slug: string; title: string };
    };

type NotificationFollowItem = {
  createdAt: string;
  actor: NotificationUser;
};

type DashboardNotificationsResponse = {
  message: string;
  data: {
    interaction: NotificationInteractionItem[];
    followNotifications: NotificationFollowItem[];
    followers: Array<{
      user: NotificationUser;
      followedAt: string;
    }>;
  };
};

type NotificationsUnreadResponse = {
  message: string;
  data: {
    unreadCount: number;
  };
};

export async function getDashboardNotificationsRequest(limit = 50) {
  return (await api.get(ENDPOINTS.dashboard.notifications, {
    params: { limit },
  })) as unknown as DashboardNotificationsResponse;
}

export async function getNotificationsUnreadRequest() {
  return (await api.get(ENDPOINTS.dashboard.notificationsUnread)) as unknown as NotificationsUnreadResponse;
}

export async function postNotificationsMarkViewedRequest() {
  return (await api.post(ENDPOINTS.dashboard.notificationsMarkViewed)) as unknown as {
    message: string;
    data: { ok: true };
  };
}
