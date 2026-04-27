import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, type FormEvent } from "react";
import { useAppSelector } from "@/shared/hooks/redux";
import { useLocation, useNavigate } from "react-router";
import type { CommentNode, CommentSort } from "@/entities/comment/types/comment";
import { toggleCommentLikeRequest } from "@/entities/comment/api/comment-api";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { cn } from "@/shared/lib/cn";
import { ChevronDown, Pin, ThumbsUp } from "lucide-react";
import Button from "@/shared/ui/button";

type Props = {
  slug: string;
  sort: CommentSort;
  comments: CommentNode[];
  /** Id of the author-picked top comment, for badge + 取消置顶. */
  pinnedCommentId?: string | null;
  isAuthenticated: boolean;
  /** Post author can pin one top-level comment. */
  isArticleAuthor?: boolean;
  onCreateComment: (payload: { content: string; parentCommentId?: string }) => Promise<void>;
  createPending?: boolean;
  onDelete?: (commentId: string) => Promise<void> | void;
  deletingId?: string | null;
  onSetPinned?: (commentId: string | null) => Promise<void> | void;
  pinPending?: boolean;
};

function formatCommentTime(iso: string) {
  const t = new Date(iso).getTime();
  const d = Date.now() - t;
  const m = Math.floor(d / 60000);
  if (m < 1) {
    return "刚刚";
  }
  if (m < 60) {
    return `${m} 分钟前`;
  }
  const h = Math.floor(m / 60);
  if (h < 24) {
    return `${h} 小时前`;
  }
  const day = Math.floor(h / 24);
  if (day < 7) {
    return `${day} 天前`;
  }
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CommentList({
  slug,
  sort: _sort,
  comments,
  pinnedCommentId = null,
  isAuthenticated,
  isArticleAuthor = false,
  onCreateComment,
  createPending = false,
  onDelete,
  deletingId = null,
  onSetPinned,
  pinPending = false,
}: Props) {
  void _sort;
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);

  const goLogin = useCallback(() => {
    void navigate("/login", { state: { from: location } });
  }, [location, navigate]);

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => toggleCommentLikeRequest(slug, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["articles", "comments", slug] });
    },
  });

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      goLogin();
      return;
    }
    setLikeBusyId(commentId);
    try {
      await likeMutation.mutateAsync(commentId);
    } finally {
      setLikeBusyId(null);
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-warm bg-ivory p-6 text-center text-stone shadow-[0_0_0_1px_#e8e6dc]">
        暂无评论
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((c) => (
        <CommentBlock
          key={c.id}
          comment={c}
          level={0}
          expanded={expanded}
          setExpanded={setExpanded}
          currentUserId={currentUser?.id}
          isAuthenticated={isAuthenticated}
          onLoginRequest={goLogin}
          onLike={handleLike}
          likeBusyId={likeBusyId}
          onDelete={onDelete}
          deletingId={deletingId}
          onRequestDelete={setPendingDeleteId}
          replyingTo={replyingTo}
          onReply={setReplyingTo}
          replyDraft={replyDraft}
          onReplyDraft={setReplyDraft}
          createPending={createPending}
          onCreateComment={onCreateComment}
          isArticleAuthor={isArticleAuthor}
          pinnedCommentId={pinnedCommentId}
          onSetPinned={onSetPinned}
          pinPending={pinPending}
        />
      ))}

      {onDelete && pendingDeleteId ? (
        <ConfirmDialog
          open
          title="删除评论"
          description="确定要删除这条评论吗？其下回复会保留，且此操作无法恢复。"
          confirmLabel="删除"
          cancelLabel="取消"
          variant="danger"
          loading={deletingId === pendingDeleteId}
          onCancel={() => {
            if (deletingId === pendingDeleteId) {
              return;
            }
            setPendingDeleteId(null);
          }}
          onConfirm={async () => {
            await onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        />
      ) : null}
    </div>
  );
}

type BlockProps = {
  comment: CommentNode;
  level: number;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  currentUserId: string | undefined;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  onLike: (id: string) => void;
  likeBusyId: string | null;
  onDelete?: (id: string) => Promise<void> | void;
  deletingId: string | null;
  onRequestDelete: (id: string) => void;
  replyingTo: string | null;
  onReply: (id: string | null) => void;
  replyDraft: string;
  onReplyDraft: (s: string) => void;
  createPending: boolean;
  onCreateComment: (payload: { content: string; parentCommentId?: string }) => Promise<void>;
  isArticleAuthor: boolean;
  pinnedCommentId: string | null;
  onSetPinned?: (commentId: string | null) => Promise<void> | void;
  pinPending: boolean;
};

function CommentBlock({
  comment,
  level,
  expanded,
  setExpanded,
  currentUserId,
  isAuthenticated,
  onLoginRequest,
  onLike,
  likeBusyId,
  onDelete,
  deletingId,
  onRequestDelete,
  replyingTo,
  onReply,
  replyDraft,
  onReplyDraft,
  createPending,
  onCreateComment,
  isArticleAuthor,
  pinnedCommentId,
  onSetPinned,
  pinPending,
}: BlockProps) {
  const canDelete = onDelete && currentUserId === comment.author.id;
  const isPinned = pinnedCommentId === comment.id;
  const canAuthorPin =
    level === 0 && isArticleAuthor && onSetPinned;
  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;
  const isOpen = expanded[comment.id] ?? false;

  const publishReply = async (e: FormEvent) => {
    e.preventDefault();
    const t = replyDraft.trim();
    if (!t) {
      return;
    }
    await onCreateComment({ content: t, parentCommentId: comment.id });
    onReplyDraft("");
    onReply(null);
    setExpanded((p) => ({ ...p, [comment.id]: true }));
  };

  return (
    <div className="flex gap-2">
      <div className="h-9 w-9 shrink-0">
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.username}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/90 text-sm font-medium text-ivory">
            {comment.author.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-ink">{comment.author.username}</span>
          {isPinned ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-terracotta/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-terracotta">
              <Pin className="h-3 w-3" aria-hidden />
              作者置顶
            </span>
          ) : null}
          <span className="text-xs text-stone">{formatCommentTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-[1.6] text-olive">
          {comment.content}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => onLike(comment.id)}
            disabled={likeBusyId === comment.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-stone transition hover:bg-warm-sand/80 hover:text-ink disabled:opacity-50",
              comment.isLiked && "text-terracotta"
            )}
          >
            <ThumbsUp
              className="h-4 w-4"
              fill={comment.isLiked ? "currentColor" : "none"}
              strokeWidth={2}
            />
            {comment.likesCount > 0 ? (
              <span className="text-xs font-medium tabular-nums text-stone">{comment.likesCount}</span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                onLoginRequest();
                return;
              }
              onReply(replyingTo === comment.id ? null : comment.id);
              onReplyDraft("");
            }}
            className="px-1.5 text-sm text-ink/80 hover:text-terracotta"
          >
            回复
          </button>

          {canDelete ? (
            <button
              type="button"
              disabled={deletingId === comment.id}
              onClick={() => onRequestDelete(comment.id)}
              className="px-1.5 text-sm text-error/90 hover:brightness-90 disabled:opacity-50"
            >
              {deletingId === comment.id ? "删除中…" : "删除"}
            </button>
          ) : null}

          {canAuthorPin ? (
            isPinned ? (
              <button
                type="button"
                disabled={pinPending}
                onClick={() => void onSetPinned(null)}
                className="px-1.5 text-sm text-olive/90 hover:text-terracotta disabled:opacity-50"
              >
                取消置顶
              </button>
            ) : (
              <button
                type="button"
                disabled={pinPending}
                onClick={() => void onSetPinned(comment.id)}
                className="inline-flex items-center gap-0.5 px-1.5 text-sm text-olive/90 hover:text-terracotta disabled:opacity-50"
                title="在列表顶部显示本条评论"
              >
                <Pin className="h-3.5 w-3.5" />
                置顶
              </button>
            )
          ) : null}
        </div>

        {replyingTo === comment.id && isAuthenticated ? (
          <form className="mt-2 space-y-2" onSubmit={publishReply}>
            <textarea
              rows={3}
              value={replyDraft}
              onChange={(e) => onReplyDraft(e.target.value)}
              placeholder="写下你的回复…"
              className="w-full rounded-xl border border-border-cream bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" className="px-3 py-1.5 text-xs" loading={createPending}>
                发布
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  onReply(null);
                  onReplyDraft("");
                }}
              >
                取消
              </Button>
            </div>
          </form>
        ) : null}

        {hasReplies && !isOpen ? (
          <button
            type="button"
            onClick={() => setExpanded((p) => ({ ...p, [comment.id]: true }))}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:underline"
          >
            查看 {comment.replyCount} 条回复
            <ChevronDown className="h-4 w-4" />
          </button>
        ) : null}

        {hasReplies && isOpen ? (
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={() => setExpanded((p) => ({ ...p, [comment.id]: false }))}
              className="mt-0 w-1 shrink-0 self-stretch min-h-[1.5rem] cursor-pointer rounded-full bg-stone-300/90 hover:bg-stone-400/90"
              title="点击折叠本层所有回复"
              aria-label="折叠本层所有回复"
            />
            <div className="min-w-0 flex-1 space-y-4 border-l border-stone-200/90 pl-3">
              {replies.map((r) => (
                <CommentBlock
                  key={r.id}
                  comment={r}
                  level={level + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  currentUserId={currentUserId}
                  isAuthenticated={isAuthenticated}
                  onLoginRequest={onLoginRequest}
                  onLike={onLike}
                  likeBusyId={likeBusyId}
                  onDelete={onDelete}
                  deletingId={deletingId}
                  onRequestDelete={onRequestDelete}
                  replyingTo={replyingTo}
                  onReply={onReply}
                  replyDraft={replyDraft}
                  onReplyDraft={onReplyDraft}
                  createPending={createPending}
                  onCreateComment={onCreateComment}
                  isArticleAuthor={isArticleAuthor}
                  pinnedCommentId={pinnedCommentId}
                  onSetPinned={onSetPinned}
                  pinPending={pinPending}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
