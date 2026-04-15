import {useNavigate} from "react-router";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createArticleRequest} from "@/entities/article/api/article-api.ts";
import type {ArticleFormValues} from "@/shared/schemas/article-schema.ts";
import ArticleForm from "@/features/create-article/ui/article-form.tsx";
import { clearDraft } from "@/features/create-article/lib/draft";

const CREATE_DRAFT_KEY = "inkflow:draft:create";


function normalizeTags(tags?: string) {
    if(!tags) return [];
    return tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 4);
}

export default function CreateArticlePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createArticleRequest,
        onSuccess: async (response) => {
            clearDraft(CREATE_DRAFT_KEY);
            await queryClient.invalidateQueries({queryKey: ['articles']});
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
        <div className="mx-auto max-w-6xl px-4 py-6">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Write a new article</h1>
                <ArticleForm
                    submitText="Publish"
                    loading={createMutation.isPending}
                    draftKey={CREATE_DRAFT_KEY}
                    onSubmit={handleSubmit}
                />
        </div>
    );
}