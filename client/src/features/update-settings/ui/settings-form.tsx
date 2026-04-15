import {type SettingsFormValues, settingsSchema} from "@/shared/schemas/settings.schemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import Input from "@/shared/ui/input.tsx";
import Button from "@/shared/ui/button.tsx";
import ImageUploadField from "@/features/upload-image/ui/image-upload-field.tsx";


type SettingsFormProps = {
    defaultValues?: Partial<SettingsFormValues>;
    loading?: boolean;
    onSubmit: (values: SettingsFormValues) => Promise<void> | void;
};

export default function SettingsForm({
    defaultValues,
    loading = false,
    onSubmit,
}: SettingsFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: {errors, isSubmitting },
    } = useForm<SettingsFormValues>({
           resolver: zodResolver(settingsSchema),
           defaultValues: {
               username: defaultValues?.username ?? "",
               bio: defaultValues?.bio ?? "",
               avatar: defaultValues?.avatar ?? "",
               password: "",
           },
    });

    useEffect(() => {
          reset({
              username: defaultValues?.username ?? "",
              bio: defaultValues?.bio ?? "",
              avatar: defaultValues?.avatar ?? "",
              password: "",
          });
    }, [defaultValues, reset]);

    const avatar = watch("avatar");

    return (
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
              await onSubmit(values);
          })}
        >
            <Input
                label="Username"
                placeholder="Enter your username"
                error={errors.username?.message}
                {...register("username")}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="Tell us about yourself"
                    {...register("bio")}
                />
                {errors.bio?.message ? (
                    <span className="text-sm text-red-500">{errors.bio.message}</span>
                ) : null}
            </div>

            <ImageUploadField
               label="Upload Profile Picture"
               layout="horizontal"
               value={avatar ?? ""}
               onUploaded={(url) => setValue("avatar", url, {shouldValidate: true})}
            />

            <Input
                label="New Password"
                type="password"
                placeholder="Leave blank if you do not want to change it"
                error={errors.password?.message}
                {...register("password")}
            />

            <Button type="submit" fullWidth loading={loading || isSubmitting}>
                Save Changes
            </Button>
        </form>
    );
}