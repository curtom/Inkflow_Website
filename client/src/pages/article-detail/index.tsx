import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteArticleRequest,
    getArticleBySlugRequest,
} from "@/entities/article/api/article-api";
import MarkdownPreview from "@/features/markdown-editor/ui/markdown-preview";
import {
   getCommentsByArticleRequest,
   createCommentRequest,
   deleteCommentRequest,
} from "@/entities/comment/api/comment-api";
import {
    toggleFavoriteArticleRequest,
    toggleLikeArticleRequest,
} from "@/features/reactions/api/reaction-api";
import { queryKeys } from "@/shared/api/query-keys";
import { useAppSelector } from "@/shared/hooks/redux";
import DeleteArticleButton from "@/features/delete-article/ui/delete-article-button";
import CommentList from "@/widgets/comment-list";
import AddCommentForm from "@/features/add-comment/ui/add-comment-form";
import { Heart, Bookmark, HashIcon } from 'lucide-react';
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

    const likeMutation = useMutation({
        mutationFn: () => toggleLikeArticleRequest(slug),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) });
            await queryClient.invalidateQueries({ queryKey: ["articles"] });
        },
    });

    const favoriteMutation = useMutation({
        mutationFn: () => toggleFavoriteArticleRequest(slug),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) });
            await queryClient.invalidateQueries({ queryKey: ["articles"] });
            await queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });

    if (isLoading) {
        return <div className="mx-auto max-w-3xl px-4 py-10 text-gray-500">Loading article...</div>;
    }

    if (isError || !article) {
        return <div className="mx-auto max-w-3xl px-4 py-10 text-gray-500">Article not found.</div>;
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">

            {/* Article card */}
            <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                {/* Header */}
                <div className="px-8 pb-6 pt-8">
                    {/* Author row */}
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/profiles/${encodeURIComponent(article.author.username)}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-500 text-sm font-semibold text-white"
                        >
                            {article.author.avatar ? (
                                <img
                                    src={article.author.avatar}
                                    alt={article.author.username}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                article.author.username.charAt(0).toUpperCase()
                            )}
                        </Link>
                        <div>
                            <Link
                                to={`/profiles/${encodeURIComponent(article.author.username)}`}
                                className="text-sm font-semibold text-gray-900 hover:text-green-600"
                            >
                                {article.author.username}
                            </Link>
                            <p className="text-xs text-gray-400">
                                {new Date(article.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
                        {article.title}
                    </h1>

                    {/* Tags */}
                    {article.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {article.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
                                >
                                    <HashIcon className="w-5 h-5" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Body */}
                <div className="px-8 py-8">
                    <MarkdownPreview content={article.content} variant="article" />
                </div>

                {/* Reaction bar */}
                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-8 py-5">
                    <button
                        type="button"
                        disabled={!isAuthenticated || likeMutation.isPending}
                        onClick={async () => {
                            if (!isAuthenticated) {
                                window.alert("Please log in to like articles.");
                                return;
                            }
                            await likeMutation.mutateAsync();
                        }}
                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                            article.isLiked
                                ? "border-red-200 bg-red-50 text-red-500"
                                : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        }`}
                    >
                        <Heart
                            className="w-5 h-5 transition-colors"
                            fill={article.isLiked ? "currentColor" : "none"}
                            strokeWidth={article.isLiked ? 0 : 2}
                        />
                        <span>{article.likesCount}</span>
                    </button>

                    <button
                        type="button"
                        disabled={!isAuthenticated || favoriteMutation.isPending}
                        onClick={async () => {
                            if (!isAuthenticated) {
                                window.alert("Please log in to save articles.");
                                return;
                            }
                            await favoriteMutation.mutateAsync();
                        }}
                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                            article.isFavorited
                                ? "border-blue-200 bg-blue-50 text-blue-500"
                                : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500"
                        }`}
                    >
                        <Bookmark
                            className="w-5 h-5 transition-colors"
                            fill={article.isFavorited ? "currentColor" : "none"}
                            strokeWidth={article.isFavorited ? 0 : 2}
                        />
                        <span>{article.favoritesCount}</span>
                    </button>

                    {isAuthor ? (
                        <div className="ml-auto flex gap-2">
                            <Link
                                to={`/editor/${article.slug}`}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                Edit
                            </Link>
                            <DeleteArticleButton
                                loading={deleteMutation.isPending}
                                onDelete={async () => {
                                    await deleteMutation.mutateAsync();
                                }}
                            />
                        </div>
                    ) : null}
                </div>
            </article>

            {/* Comments */}
            <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                    Comments ({comments.length})
                </h2>

                {isAuthenticated ? (
                    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <AddCommentForm
                            loading={createCommentMutation.isPending}
                            onSubmit={async (content) => {
                                await createCommentMutation.mutateAsync(content);
                            }}
                        />
                    </div>
                ) : (
                    <p className="mb-5 text-sm text-gray-500">
                        Please{" "}
                        <Link to="/login" className="text-green-600 hover:underline">
                            log in
                        </Link>{" "}
                        to leave a comment.
                    </p>
                )}

                {commentsQuery.isLoading ? <p className="text-sm text-gray-400">Loading comments...</p> : null}
                {commentsQuery.isError ? <p className="text-sm text-red-400">Error loading comments.</p> : null}
                {!commentsQuery.isLoading && !commentsQuery.isError ? (
                    <CommentList
                        comments={comments}
                        deletingId={
                            deleteCommentMutation.isPending
                                ? String(deleteCommentMutation.variables ?? "")
                                : null
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
