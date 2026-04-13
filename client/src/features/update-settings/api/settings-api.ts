import {ENDPOINTS} from "@/shared/api/endpoints.ts";
import {api} from "@/shared/api/axios.ts";


export type UpdateSettingsPayload = {
    username?: string;
    bio?: string;
    avatar?: string;
    password?: string;
};

type CurrentUserProfileResponse = {
    message: string;
    data: {
        user: {
            id: string;
            username: string;
            email: string;
            bio?: string;
            avatar?: string;
        };
    };
};

export async function getCurrentUserProfileRequest(): Promise<CurrentUserProfileResponse> {
    const response =  (await api.get(ENDPOINTS.users.me)) as unknown as CurrentUserProfileResponse;
    return response;
}

export async function updateCurrentUserProfileRequest(payload: UpdateSettingsPayload): Promise<CurrentUserProfileResponse> {
    const response = (await api.patch(
        ENDPOINTS.users.updateMe,
        payload
    )) as unknown as CurrentUserProfileResponse;
    return response;
}