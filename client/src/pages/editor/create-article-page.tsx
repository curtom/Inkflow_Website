import {useNavigate} from "react-router";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createArticleRequest} from "@/entities/article/api/article-api.ts";
import type {ArticleFormValues} from "@/shared/schemas/article-schema.ts";
import ArticleForm from "@/features/create-article/ui/article-form.tsx";


function normalizeTags(tags?: string) {
    if(!tags) return [];
    return tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
}

export default function CreateArticlePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createArticleRequest,
        onSuccess: async (response)  => {
            await queryClient.invalidateQueries({queryKey: ['articles']});
            console.log("create response =", response);
            navigate(`/articles/${response.article.slug}`);
        },
    });

    const handleSubmit = async (values: ArticleFormValues) => {
        await createMutation.mutateAsync({
            title: values.title,
            summary: values.summary,
            content: values.content,
            coverImage: values.coverImage || "",
            tags: normalizeTags(values.tags),
        });
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">Write a new article</h1>
            <div className="rounded-2xl border border-gray-200 bg-whilte p-6 shadow-sm">
                <ArticleForm
                    submitText="Publish Article"
                    loading={createMutation.isPending}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}