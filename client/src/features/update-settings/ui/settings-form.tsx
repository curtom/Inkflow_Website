import {type SettingsFormValues, settingsSchema} from "@/shared/schemas/settings.schemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";


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


}