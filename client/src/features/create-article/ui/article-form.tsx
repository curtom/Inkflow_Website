import {type ArticleFormValues, articleSchema} from "@/shared/schemas/article-schema.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Input from "@/shared/ui/input.tsx";
import Button from "@/shared/ui/button.tsx";


type ArticleFormProps = {
    defaultValues?: Partial<ArticleFormValues>;
    submitText?: string;
    loading?: boolean;
    onSubmit: (values: ArticleFormValues) => Promise<void> | void;
};

export default function ArticleForm({
    defaultValues,
    submitText,
    loading = false,
    onSubmit,
}:ArticleFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ArticleFormValues>({
        resolver: zodResolver(articleSchema),
        defaultValues : {
            title: defaultValues?.title ?? "",
            summary: defaultValues?.summary ?? "",
            content: defaultValues?.content ?? "",
            coverImage: defaultValues?. coverImage ?? "",
            tags: defaultValues?.tags ?? "",
        },
    });

    return (
        <form
          onSubmit={handleSubmit(async (values) => {
              await onSubmit(values);
          })}
          className="space-y-4"
        >
            <Input
              label="Title"
              placeholder="Enter article title"
              error={errors.title?.message}
              {...register("title")}
            />

            <Input
              label="Summary"
              placeholder="Write a short summary"
              error={errors.summary?.message}
              {...register("summary")}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea
                   rows={10}
                   className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                   placeholder="Write your article content"
                   {...register("content")}
                />
                {errors.content?.message && (
                    <span className="text-sm text-red-500">{errors.content.message}</span>
                )}
            </div>

            <Input
               label="Cover Image URL"
               placeholder="Enter cover image URL"
               error={errors.coverImage?.message}
               {...register("coverImage")}
            />

            <Input
               label="Tags"
               placeholder="React, TypeScript"
               error={errors.tags?.message}
               {...register("tags")}
            />

            <Button type="submit" fullWidth loading={loading || isSubmitting }>
                {submitText}
            </Button>
        </form>
    );
}