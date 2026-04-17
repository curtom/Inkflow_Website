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
