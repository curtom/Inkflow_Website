import { useState } from "react";
import Button from "@/shared/ui/button";


type Props = {
    onSubmit: (content: string) => Promise<void>;
    loading?: boolean;
};

export default function AddCommentForm({onSubmit, loading = false}: Props) {
    const [content, setContent] = useState("");

    return (
      <form 
        className="space-y-3"
        onSubmit={async (e) => {
            e.preventDefault();
            const trimmed = content.trim();
            if(!trimmed) return;
            await onSubmit(trimmed);
            setContent("");
        }}
      >
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Add a comment</label>
            <textarea 
               rows={4}
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Write a comment..."
               className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
        </div>

        <Button type="submit" loading={loading}>
            Post Comment 
        </Button>
      </form>
    );
}