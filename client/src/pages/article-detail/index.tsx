import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteArticleRequest,
    getArticleBySlugRequest,
} from "@/entities/article/api/article-api";
import {
   getCommentsByArticleRequest,
   createCommentRequest,
   deleteCommentRequest,
} from "@/entities/comment/api/comment-api";
import { queryKeys } from "@/shared/api/query-keys";
import { useAppSelector } from "@/shared/hooks/redux";
import DeleteArticleButton from "@/features/delete-article/ui/delete-article-button";
import CommentList from "@/widgets/comment-list";
import AddCommentForm from "@/features/add-comment/ui/add-comment-form";
export default function ArticleDetailPage() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.articles.detail(slug),
        queryFn: () => getArticleBySlugRequest(slug),
        enabled: Boolean(slug),
    });

    const commentsQuery = useQuery({
        queryKey: queryKeys.articles.comments(slug),
        queryFn: () => getCommentsByArticleRequest(slug),
        enabled: Boolean(slug),
    });

    const article = data?.article;
    const comments = commentsQuery.data?.data.comments ?? [];
    const isAuthor = currentUser?.id && article?.author.id === currentUser.id;

    const deleteMutation = useMutation({
        mutationFn: () => deleteArticleRequest(slug),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["articles"] });
            navigate("/");
        },
    });

    const createCommentMutation = useMutation({
        mutationFn: (content: string) => createCommentRequest(slug, content),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.articles.comments(slug),
            });
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => deleteCommentRequest(slug, commentId),
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.articles.comments(slug),
          });
        },
      });

    if (isLoading) {
        return <div className="mx-auto max-w-4xl px-4 py-10">Loading article...</div>;
    }

    if (isError || !article) {
        return <div className="mx-auto max-w-4xl px-4 py-10">Article not found.</div>;
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <p className="text-sm text-gray-500">
                By {article.author.username} ·{" "}
                {new Date(article.createdAt).toLocaleDateString()}
            </p>

            <h1 className="mt-3 text-4xl font-bold text-gray-900">{article.title}</h1>

            <p className="mt-4 text-lg text-gray-600">{article.summary}</p>

            {article.coverImage ? (
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="mt-6 h-80 w-full rounded-2xl object-cover"
                />
            ) : null}

            {article.tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                    {article.tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                        >
              #{tag}
            </span>
                    ))}
                </div>
            ) : null}

            <div className="prose mt-8 max-w-none whitespace-pre-wrap text-gray-800">
                {article.content}
            </div>

            {isAuthor ? (
                <div className="mt-10 flex gap-3">
                    <Link
                        to={`/editor/${article.slug}`}
                        className="inline-flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
                    >
                        Edit Article
                    </Link>

                    <DeleteArticleButton
                        loading={deleteMutation.isPending}
                        onDelete={async () => {
                            const confirmed = window.confirm(
                                "Are you sure you want to delete this article?"
                            );
                            if (!confirmed) return;
                            await deleteMutation.mutateAsync();
                        }}
                    />
                </div>
            ) : null}

            <section className="mt-14">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Comments</h2>

                {isAuthenticated ? (
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <AddCommentForm 
                          loading={createCommentMutation.isPending}
                          onSubmit={async (content) => {
                            await createCommentMutation.mutateAsync(content);
                          }}
                        />
                    </div>
                ) : (
                    <p className="mb-6 text-gray-600">
                        Please log in to leave a comment.
                    </p>
                )}

                {commentsQuery.isLoading ? <p>Loading comments...</p> : null}
                {commentsQuery.isError ? <p>Error loading comments.</p> : null}
                {!commentsQuery.isLoading && !commentsQuery.isError ? (
                    <CommentList 
                      comments={comments}
                      deletingId={
                        deleteCommentMutation.isPending ? String(deleteCommentMutation.variables ?? "") : null
                      }
                      onDelete={async (commentId) => {
                        await deleteCommentMutation.mutateAsync(commentId);
                      }}
                    />
                ) : null}
            </section>
        </div>
    );
}