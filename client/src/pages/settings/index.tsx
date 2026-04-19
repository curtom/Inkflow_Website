import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAppDispatch} from "@/shared/hooks/redux.ts";
import {queryKeys} from "@/shared/api/query-keys.ts";
import {
    getCurrentUserProfileRequest,
    updateCurrentUserProfileRequest
} from "@/features/update-settings/api/settings-api.ts";
import {setCurrentUser} from "@/features/auth/model/auth-slice.ts";
import type {SettingsFormValues} from "@/shared/schemas/settings.schemas.ts";
import SettingsForm from "@/features/update-settings/ui/settings-form.tsx";


export default function SettingsPage() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getCurrentUserProfileRequest,
    });

    const updateMutation = useMutation({
        mutationFn: updateCurrentUserProfileRequest,
        onSuccess: async (response) => {
            const user = response.data.user;
            dispatch(setCurrentUser(user));
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
            await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        },
    });

    const user = data?.data.user;

    const handleSubmit = async (values: SettingsFormValues) => {
        const payload: {
            username?: string;
            bio?: string;
            avatar?: string;
            password?: string;
        } = {
            username: values.username,
            bio: values.bio ?? "",
        };

        payload.avatar = values.avatar?.trim() ?? "";

        if (values.password?.trim()) {
            payload.password = values.password;
        }

        await updateMutation.mutateAsync(payload);
        window.alert("Profile updated successfully");
    };

    if(isLoading) {
        return <div className="mx-auto max-w-3xl px-4 py-10">Loading profile...</div>
    }

    if(isError || !user) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                Failed to load profile.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="mb-2 text-3xl font-medium text-ink">Settings</h1>
            <p className="mb-6 text-charcoal">
                Update your personal information and password.
            </p>

            <div className="rounded-2xl border border-border-cream bg-ivory p-6 shadow-whisper">
                <SettingsForm
                    defaultValues={{
                        username: user.username,
                        bio: user.bio ?? "",
                        avatar: user.avatar ?? "",
                    }}
                    loading={updateMutation.isPending}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}