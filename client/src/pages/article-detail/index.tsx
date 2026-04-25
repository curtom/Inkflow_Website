import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteArticleRequest, getArticleBySlugRequest } from "@/entities/article/api/article-api";
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
import { Heart, Bookmark, HashIcon, MessageCircle } from "lucide-react";

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
      await queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentRequest(slug, commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.articles.comments(slug),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) });
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-olive">Loading article...</div>
    );
  }

  if (isError || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-stone">Article not found.</div>
    );
  }

  const scrollToComments = () => {
    document.getElementById("article-comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div
        className="hidden md:fixed md:left-[max(1rem,calc((100vw-min(100vw,56rem))/2+0.5rem))] md:top-36 md:z-30 md:flex md:w-10 md:flex-col md:items-center md:gap-4 md:py-1"
        role="group"
        aria-label="文章互动"
      >
            <button
              type="button"
              title="赞"
              disabled={!isAuthenticated || likeMutation.isPending}
              onClick={async () => {
                if (!isAuthenticated) {
                  window.alert("Please log in to like articles.");
                  return;
                }
                await likeMutation.mutateAsync();
              }}
              className={`flex w-full max-w-10 flex-col items-center gap-0.5 rounded-2xl border py-2 text-sm font-medium transition disabled:opacity-60 ${
                article.isLiked
                  ? "border-terracotta/40 bg-parchment text-terracotta shadow-[0_0_0_1px_#c96442]"
                  : "border-border-cream bg-ivory text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:border-terracotta/30 hover:bg-parchment hover:text-terracotta"
              }`}
            >
              <Heart
                className="h-5 w-5"
                fill={article.isLiked ? "currentColor" : "none"}
                strokeWidth={article.isLiked ? 0 : 2}
              />
              <span className="text-xs tabular-nums leading-none">{article.likesCount}</span>
            </button>

            <button
              type="button"
              title="收藏"
              disabled={!isAuthenticated || favoriteMutation.isPending}
              onClick={async () => {
                if (!isAuthenticated) {
                  window.alert("Please log in to save articles.");
                  return;
                }
                await favoriteMutation.mutateAsync();
              }}
              className={`flex w-full max-w-10 flex-col items-center gap-0.5 rounded-2xl border py-2 text-sm font-medium transition disabled:opacity-60 ${
                article.isFavorited
                  ? "border-coral/45 bg-parchment text-coral shadow-[0_0_0_1px_#d97757]"
                  : "border-border-cream bg-ivory text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:border-coral/35 hover:bg-parchment hover:text-coral"
              }`}
            >
              <Bookmark
                className="h-5 w-5"
                fill={article.isFavorited ? "currentColor" : "none"}
                strokeWidth={article.isFavorited ? 0 : 2}
              />
              <span className="text-xs tabular-nums leading-none">{article.favoritesCount}</span>
            </button>

            <button
              type="button"
              title="跳转到评论区"
              onClick={scrollToComments}
              className="flex w-full max-w-10 flex-col items-center gap-0.5 rounded-2xl border border-border-cream bg-ivory py-2 text-sm font-medium text-charcoal shadow-[0_0_0_1px_#f0eee6] transition hover:border-terracotta/30 hover:bg-parchment hover:text-terracotta"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={2} />
              <span className="text-xs tabular-nums leading-none">{article.commentsCount}</span>
            </button>
      </div>

        <div className="min-w-0 max-w-3xl md:max-w-none md:pl-5">
      <article className="overflow-hidden rounded-[32px] border border-border-cream bg-ivory shadow-whisper">
        <div className="px-8 pb-6 pt-8">
          <div className="flex items-center gap-3">
            <Link
              to={`/profiles/${encodeURIComponent(article.author.username)}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-terracotta text-sm font-medium text-ivory"
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
                className="text-sm font-medium text-ink hover:text-terracotta"
              >
                {article.author.username}
              </Link>
              <p className="text-xs text-stone">
                {new Date(article.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <h1 className="font-editorial mt-5 text-4xl font-medium leading-[1.15] tracking-tight text-ink md:text-5xl">
            {article.title}
          </h1>

          {article.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full bg-warm-sand px-2.5 py-1 text-sm font-medium text-charcoal shadow-[0_0_0_1px_#d1cfc5]"
                >
                  <HashIcon className="h-5 w-5" />
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="border-t border-border-cream" />

        <div className="px-8 py-8">
          <MarkdownPreview content={article.content} variant="article" />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-cream px-8 py-5">
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
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
              article.isLiked
                ? "border-terracotta/40 bg-parchment text-terracotta shadow-[0_0_0_1px_#c96442]"
                : "border-border-cream bg-white text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:border-terracotta/30 hover:bg-parchment hover:text-terracotta"
            }`}
          >
            <Heart
              className="h-5 w-5 transition-colors"
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
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
              article.isFavorited
                ? "border-coral/45 bg-parchment text-coral shadow-[0_0_0_1px_#d97757]"
                : "border-border-cream bg-white text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:border-coral/35 hover:bg-parchment hover:text-coral"
            }`}
          >
            <Bookmark
              className="h-5 w-5 transition-colors"
              fill={article.isFavorited ? "currentColor" : "none"}
              strokeWidth={article.isFavorited ? 0 : 2}
            />
            <span>{article.favoritesCount}</span>
          </button>

          {isAuthor ? (
            <div className="ml-auto flex gap-2">
              <Link
                to={`/editor/${article.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-border-cream bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-[0_0_0_1px_#f0eee6] transition hover:bg-parchment"
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

      <section id="article-comments" className="mt-10 scroll-mt-24">
        <h2 className="font-editorial mb-4 text-2xl font-medium text-ink">
          Comments ({comments.length})
        </h2>

        {isAuthenticated ? (
          <div className="mb-5 rounded-2xl border border-border-cream bg-ivory p-6 shadow-whisper">
            <AddCommentForm
              loading={createCommentMutation.isPending}
              onSubmit={async (content) => {
                await createCommentMutation.mutateAsync(content);
              }}
            />
          </div>
        ) : (
          <p className="mb-5 text-sm text-olive">
            Please{" "}
            <Link to="/login" className="text-terracotta hover:underline">
              log in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        {commentsQuery.isLoading ? (
          <p className="text-sm text-stone">Loading comments...</p>
        ) : null}
        {commentsQuery.isError ? (
          <p className="text-sm text-error">Error loading comments.</p>
        ) : null}
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
    </div>
  );
}
