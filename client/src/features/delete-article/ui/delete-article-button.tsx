import { useState } from "react";
import Button from "@/shared/ui/button.tsx";
import ConfirmDialog from "@/shared/ui/confirm-dialog";

type Props = {
  onDelete: () => Promise<void> | void;
  loading?: boolean;
};

export default function DeleteArticleButton({ onDelete, loading = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        Delete Article
      </Button>
      <ConfirmDialog
        open={open}
        title="删除文章"
        description="确定要删除这篇文章吗？删除后无法恢复。"
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        loading={loading}
        onCancel={() => !loading && setOpen(false)}
        onConfirm={async () => {
          await onDelete();
          setOpen(false);
        }}
      />
    </>
  );
}
