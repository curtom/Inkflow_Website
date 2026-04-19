import { useState } from "react";
import Button from "@/shared/ui/button";

type Props = {
  onSubmit: (content: string) => Promise<void>;
  loading?: boolean;
};

export default function AddCommentForm({ onSubmit, loading = false }: Props) {
  const [content, setContent] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;
        await onSubmit(trimmed);
        setContent("");
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-olive">Add a comment</label>
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full rounded-xl border border-border-cream bg-parchment px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone focus:border-focus focus:ring-2 focus:ring-focus/25"
        />
      </div>

      <Button type="submit" loading={loading}>
        Post Comment
      </Button>
    </form>
  );
}
