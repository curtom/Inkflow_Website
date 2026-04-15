import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import ArticleForm from "@/features/create-article/ui/article-form";
import { clearDraft } from "@/features/create-article/lib/draft";
import {
    getArticleBySlugRequest,
    updateArticleRequest,
} from "@/entities/article/api/article-api";
import { queryKeys } from "@/shared/api/query-keys";
import type { ArticleFormValues } from "@/shared/schemas/article-schema";
import { useAppSelector } from "@/shared/hooks/redux";

function toTagInput(tags: string[]) {
    return tags.join(", ");
}

function normalizeTags(tags?: string) {
    if (!tags) return [];
    return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4);
}

export default function EditArticlePage() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = useAppSelector((state) => state.auth.user);

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.articles.detail(slug),
        queryFn: () => getArticleBySlugRequest(slug),
        enabled: Boolean(slug),
    });

    const article = data?.article;
    const isAuthor = currentUser?.id && article?.author.id === currentUser.id;

    const draftKey = `inkflow:draft:edit:${slug}`;

    const updateMutation = useMutation({
        mutationFn: (payload: Parameters<typeof updateArticleRequest>[1]) =>
            updateArticleRequest(slug, payload),
        onSuccess: async (response) => {
            clearDraft(draftKey);
            await queryClient.invalidateQueries({ queryKey: ["articles"] });
            await queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) });
            navigate(`/articles/${response.article.slug}`);
        },
    });

    if (isLoading) {
        return <div className="mx-auto max-w-3xl px-4 py-10">Loading article...</div>;
    }

    if (isError || !article) {
        return <div className="mx-auto max-w-3xl px-4 py-10">Article not found.</div>;
    }

    if (!isAuthor) {
        return <div className="mx-auto max-w-3xl px-4 py-10">You are not allowed to edit this article.</div>;
    }

    const handleSubmit = async (values: ArticleFormValues) => {
        await updateMutation.mutateAsync({
            title: values.title,
            summary: values.summary,
            content: values.content,
            coverImage: values.coverImage || "",
            tags: normalizeTags(values.tags),
        });
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Edit Post</h1>
    
          <ArticleForm
            submitText="Update"
            loading={updateMutation.isPending}
            draftKey={draftKey}
            onSubmit={handleSubmit}
            defaultValues={{
              title: article.title,
              summary: article.summary,
              content: article.content,
              coverImage: article.coverImage ?? "",
              tags: toTagInput(article.tags),
            }}
          />
        </div>
      );
}