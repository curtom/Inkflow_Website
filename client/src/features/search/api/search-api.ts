import { api } from "@/shared/api/axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { SearchResponse } from "@/entities/search/types/search";


export async function searchOverviewRequest(keyword: string) {
    return (await api.get(ENDPOINTS.search.overview, {
        params: { keyword },
    })) as unknown as SearchResponse;
}