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

     if(!comments.length) {
        return (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No comments yet.
          </div>
        );
     }

     return (
        <div>
            {comments.map((comment) => {
                const canDelete = currentUser?.id === comment.author.id;

                return (
                    <div 
                      key={comment.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                       <div className="flex items-center justify-between gap-4">
                         <div>
                           <p className="text-sm font-medium text-gray-900">
                            {comment.author.username}
                           </p>
                           <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                           </p>
                         </div>

                         {canDelete && onDelete ? (
                            <button
                              type="button"
                              disabled={deletingId === comment.id}
                              onClick={() => setPendingDeleteId(comment.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                            >
                                {deletingId === comment.id ? "Deleting..." : "Delete"}
                            </button>
                         ) : null}
                       </div>

                       <p className="mt-3 whitespace-pre-wrap text-gray-700">
                        {comment.content}
                       </p>
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