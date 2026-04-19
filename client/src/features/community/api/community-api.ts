import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/entities/article";

export type CommunityTagSuggestion = {
  communityId: string;
  tabKey: string;
  label: string;
  tag: string;
  score: number;
  meetsThreshold: boolean;
};

export type SuggestCommunityTagsResult = {
  threshold: number;
  suggestions: CommunityTagSuggestion[];
  matchedTags: string[];
  disabledReason?: "missing_api_key";
};

export async function suggestCommunityTagsRequest(body: {
  title: string;
  summary: string;
  content: string;
  tags?: string[];
}): Promise<SuggestCommunityTagsResult> {
  const response = (await api.post(
    ENDPOINTS.community.suggestTags,
    body
  )) as unknown as ApiResponse<SuggestCommunityTagsResult>;

  return response.data;
}
