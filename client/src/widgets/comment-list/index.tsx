import { useState } from "react";
import { useAppSelector } from "@/shared/hooks/redux";
import type { Comment } from "@/entities/comment/types/comment";
import ConfirmDialog from "@/shared/ui/confirm-dialog";

type Props = {
  comments: Comment[];
  onDelete?: (commentId: string) => Promise<void> | void;
  deletingId?: string | null;
};

export default function CommentList({
  comments,
  onDelete,
  deletingId = null,
}: Props) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!comments.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border-warm bg-ivory p-6 text-center text-stone shadow-[0_0_0_1px_#e8e6dc]">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete = currentUser?.id === comment.author.id;

        return (
          <div
            key={comment.id}
            className="rounded-2xl border border-border-cream bg-ivory p-4 shadow-[0_0_0_1px_#f0eee6]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{comment.author.username}</p>
                <p className="text-xs text-stone">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>

              {canDelete && onDelete ? (
                <button
                  type="button"
                  disabled={deletingId === comment.id}
                  onClick={() => setPendingDeleteId(comment.id)}
                  className="cursor-pointer text-sm font-medium text-error hover:brightness-90 disabled:opacity-50"
                >
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              ) : null}
            </div>

            <p className="mt-3 whitespace-pre-wrap leading-[1.6] text-olive">{comment.content}</p>
          </div>
        );
      })}

      {onDelete && pendingDeleteId ? (
        <ConfirmDialog
          open={true}
          title="删除评论"
          description="确定要删除这条评论吗？删除后无法恢复。"
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
